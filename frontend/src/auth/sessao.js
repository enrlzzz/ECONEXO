/**
 * Fluxos de conta: entrar, criar conta, Google, sair, recuperar senha.
 *
 * Duas etapas em toda entrada:
 *  1. o Firebase confere e-mail e senha (ou o Google) e devolve um ID token;
 *  2. POST /api/auth/firebase liga essa identidade ao cadastro do backend e
 *     devolve o usuário (nome, cidade, tipo profissional...).
 * Só depois da etapa 2 a interface se considera logada.
 */
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth, firebaseConfigurado } from "./firebase";
import { api } from "../services/api";
import { logout, persistUser } from "../userSession";

/** Erro que a tela mostra como está: já vem em português e sem detalhe técnico. */
export class ErroDeConta extends Error {
  constructor(mensagem, codigo) {
    super(mensagem);
    this.codigo = codigo;
  }
}

const MENSAGENS = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/missing-password": "Digite sua senha.",
  "auth/email-already-in-use": "Já existe uma conta com este e-mail. Tente entrar.",
  "auth/weak-password": "A senha precisa ter pelo menos 8 caracteres.",
  "auth/password-does-not-meet-requirements": "A senha precisa ter pelo menos 8 caracteres.",
  "auth/too-many-requests": "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Verifique sua internet e tente de novo.",
  "auth/popup-closed-by-user": "A janela do Google foi fechada antes de concluir.",
  "auth/cancelled-popup-request": "A janela do Google foi fechada antes de concluir.",
  "auth/popup-blocked": "O navegador bloqueou a janela do Google. Libere pop-ups para este site.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/account-exists-with-different-credential":
    "Este e-mail já tem conta com outra forma de entrada. Entre com e-mail e senha.",
};

function traduzir(e) {
  if (e instanceof ErroDeConta) return e;
  const msg = MENSAGENS[e?.code];
  // Código desconhecido: mensagem genérica. O código cru do Firebase não
  // diz nada a quem está tentando entrar.
  return new ErroDeConta(msg || "Não foi possível concluir agora. Tente de novo.", e?.code);
}

function exigirConfig() {
  if (!firebaseConfigurado) {
    throw new ErroDeConta("O login está indisponível no momento.", "config");
  }
}

/** ID token atual (o SDK renova sozinho perto de expirar). */
export async function obterIdToken() {
  if (!auth) return null;
  await auth.authStateReady();
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}

/**
 * Etapa 2: liga ao backend. 428 = falta concluir o cadastro (nome + LGPD),
 * 409 = conta antiga com este e-mail e e-mail ainda não confirmado.
 */
async function vincular(dadosCadastro) {
  try {
    const { usuario } = await api.post("/auth/firebase", dadosCadastro ?? {});
    persistUser(usuario);
    return { status: "ok", usuario };
  } catch (e) {
    if (e.status === 428) return { status: "concluir-cadastro" };
    if (e.status === 409) return { status: "confirmar-email", mensagem: e.message };
    throw new ErroDeConta(e.message || "Não foi possível entrar agora. Tente de novo.");
  }
}

export async function entrar(email, senha) {
  exigirConfig();
  try {
    await signInWithEmailAndPassword(auth, email.trim(), senha);
  } catch (e) {
    throw traduzir(e);
  }
  return vincular();
}

export async function entrarComGoogle() {
  exigirConfig();
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (e) {
    throw traduzir(e);
  }
  return vincular();
}

/**
 * Cria a conta no Firebase e o cadastro no backend na sequência.
 * dadosCadastro: { nome, cidade, estado, tipoProfissional, consentimentoLgpd }.
 */
export async function criarConta(email, senha, dadosCadastro) {
  exigirConfig();
  if (!dadosCadastro?.consentimentoLgpd) {
    throw new ErroDeConta("Para criar a conta, aceite a Política de Privacidade.");
  }
  let credencial;
  try {
    credencial = await createUserWithEmailAndPassword(auth, email.trim(), senha);
  } catch (e) {
    throw traduzir(e);
  }
  // Confirmação de e-mail: necessária para vincular uma conta antiga com o
  // mesmo e-mail e para recuperar a senha com segurança. Falha aqui não
  // impede o cadastro.
  sendEmailVerification(credencial.user).catch(() => {});
  return vincular(dadosCadastro);
}

/** Para quem entrou com Google pela primeira vez (resposta 428). */
export function concluirCadastro(dadosCadastro) {
  if (!dadosCadastro?.consentimentoLgpd) {
    throw new ErroDeConta("Para concluir, aceite a Política de Privacidade.");
  }
  return vincular(dadosCadastro);
}

/** Depois de clicar no link do e-mail: recarrega o status e tenta de novo. */
export async function tentarVincularDeNovo() {
  exigirConfig();
  await auth.currentUser?.reload();
  await auth.currentUser?.getIdToken(true);
  return vincular();
}

export async function reenviarConfirmacao() {
  exigirConfig();
  if (auth.currentUser) {
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (e) {
      throw traduzir(e);
    }
  }
}

/**
 * Sempre "deu certo", exista ou não a conta: responder diferente revelaria
 * quais e-mails estão cadastrados.
 */
export async function recuperarSenha(email) {
  exigirConfig();
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (e) {
    if (e?.code === "auth/invalid-email" || e?.code === "auth/missing-email") throw traduzir(e);
    if (e?.code === "auth/too-many-requests" || e?.code === "auth/network-request-failed") throw traduzir(e);
  }
}

export async function sair() {
  logout();
  if (auth) await signOut(auth).catch(() => {});
}

/**
 * Mantém o cache do localStorage em sintonia com o Firebase. Se a sessão do
 * Firebase acabou (expirou, saiu em outra aba), a interface deixa de se
 * achar logada.
 */
export function observarSessao() {
  if (!auth) {
    logout();
    return () => {};
  }
  return onAuthStateChanged(auth, (usuario) => {
    if (!usuario) logout();
  });
}
