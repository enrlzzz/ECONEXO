/**
 * Fluxos de conta: entrar, criar conta, sair.
 *
 * Login pelo backend próprio (Render): POST /api/auth/login devolve um JWT
 * e o usuário; POST /api/usuarios cria a conta. A senha vai no CORPO, nunca
 * na URL, e só o hash BCrypt fica no banco.
 */
import { api } from "../services/api";
import { logout, persistSession } from "../userSession";

/** Erro que a tela mostra como está: já vem em português e sem detalhe técnico. */
export class ErroDeConta extends Error {
  constructor(mensagem, codigo) {
    super(mensagem);
    this.codigo = codigo;
  }
}

function traduzir(e) {
  if (e instanceof ErroDeConta) return e;
  if (e?.status === 401) return new ErroDeConta("E-mail ou senha incorretos.", "credenciais");
  if (e?.status === 409) return new ErroDeConta(e.message || "Já existe uma conta com este e-mail. Tente entrar.", "duplicado");
  if (e?.status === 429) return new ErroDeConta(e.message || "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.", "limite");
  // O api.js já traz a mensagem da API (campo inválido, 5xx amigável, etc.).
  return new ErroDeConta(e?.message || "Não foi possível concluir agora. Tente de novo.", "erro");
}

export async function entrar(email, senha) {
  try {
    const resposta = await api.post("/auth/login", { email: email.trim(), senha });
    persistSession(resposta);
    return { status: "ok", usuario: resposta.usuario };
  } catch (e) {
    throw traduzir(e);
  }
}

/**
 * Cria o cadastro no backend e já entra.
 * dadosCadastro: { nome, cidade, estado, cpf, telefone, dataNascimento,
 * tipoProfissional, consentimentoLgpd }.
 */
export async function criarConta(email, senha, dadosCadastro) {
  if (!dadosCadastro?.consentimentoLgpd) {
    throw new ErroDeConta("Para criar a conta, aceite a Política de Privacidade.");
  }
  try {
    await api.post("/usuarios", { ...dadosCadastro, email: email.trim(), senha });
  } catch (e) {
    throw traduzir(e);
  }
  return entrar(email, senha);
}

export async function sair() {
  logout();
}
