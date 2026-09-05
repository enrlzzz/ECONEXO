// Centraliza leitura/escrita da sessão do usuário no localStorage.
// Login persistente: enquanto houver userId, considera-se logado.

const PALETTE = [
  "#2A26C7",
  "#0E8F5A",
  "#C24A1E",
  "#7A2BC4",
  "#1F6FD6",
  "#E8911B",
  "#D24B6A",
  "#16A085",
];

export function getInitials(nome) {
  if (!nome) return "?";
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function colorFor(seed) {
  if (!seed) return PALETTE[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const TOKEN_KEY = "authToken";
const TOKEN_EXP_KEY = "authTokenExpiraEm";

/**
 * Guarda o token JWT devolvido pelo login.
 *
 * É esse token que autoriza de verdade — o backend rejeita qualquer chamada
 * sem ele. Os demais campos abaixo são só para a interface desenhar nome e
 * avatar sem ter que perguntar à API a cada tela.
 */
export function persistSession({ token, expiraEmSegundos, usuario }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(
      TOKEN_EXP_KEY,
      String(Date.now() + (expiraEmSegundos ?? 8 * 3600) * 1000),
    );
  }
  persistUser(usuario);
}

export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  // Expirado: limpa aqui para a interface não continuar se achando logada
  // enquanto toda chamada à API volta 401.
  const expiraEm = Number(localStorage.getItem(TOKEN_EXP_KEY) || 0);
  if (expiraEm && Date.now() > expiraEm) {
    logout();
    return null;
  }
  return token;
}

export function persistUser(usuario) {
  if (!usuario) return;
  const id = String(usuario.idUsuario ?? usuario.id ?? "");
  localStorage.setItem("userId", id);
  localStorage.setItem("userName", usuario.nome ?? "");
  localStorage.setItem("userEmail", usuario.email ?? "");
  localStorage.setItem("userCidade", usuario.cidade ?? "");
  localStorage.setItem("userEstado", usuario.estado ?? "");
  // A API chama de tipoProfissional (INSTALADOR/PROJETISTA/TECNICO). Guardamos
  // o código cru, não um rótulo: quem traduz para texto é format.js, num
  // lugar só. Antes o padrão era "Profissional", o que fazia todo mundo
  // aparecer como profissional mesmo sem ter informado nada.
  localStorage.setItem("userRole", usuario.tipoProfissional ?? "");
  localStorage.setItem("userAdmin", usuario.admin ? "1" : "0");
  localStorage.setItem("userInitials", getInitials(usuario.nome));
  localStorage.setItem("userColor", colorFor(id || usuario.email || usuario.nome));

  // Avisa a própria aba. O evento "storage" nativo do navegador só chega às
  // OUTRAS abas, então sem isto o header continuava com o nome antigo depois
  // de salvar o perfil.
  window.dispatchEvent(new Event("econexo:sessao"));
}

export function getUser() {
  const id = localStorage.getItem("userId");
  if (!id) return null;
  const nome = localStorage.getItem("userName") || "";
  return {
    id,
    nome,
    email: localStorage.getItem("userEmail") || "",
    cidade: localStorage.getItem("userCidade") || "",
    estado: localStorage.getItem("userEstado") || "",
    role: localStorage.getItem("userRole") || "",
    initials: localStorage.getItem("userInitials") || getInitials(nome),
    color: localStorage.getItem("userColor") || colorFor(id),
  };
}

/**
 * Só serve para a interface decidir o que desenhar. NÃO é autorização:
 * qualquer pessoa edita o localStorage no DevTools. Quem autoriza de fato é
 * o backend, que valida a assinatura do token a cada requisição.
 */
export function isLoggedIn() {
  return Boolean(getToken());
}

/**
 * Também NÃO é autorização — só decide se o item do painel aparece no menu.
 * Quem autoriza é o backend, em cada endpoint administrativo.
 */
export function isAdmin() {
  return isLoggedIn() && localStorage.getItem("userAdmin") === "1";
}

export function logout() {
  [
    TOKEN_KEY,
    TOKEN_EXP_KEY,
    "userId",
    "userName",
    "userEmail",
    "userCidade",
    "userEstado",
    "userRole",
    "userInitials",
    "userColor",
    "userAdmin",
  ].forEach((k) => localStorage.removeItem(k));

  window.dispatchEvent(new Event("econexo:sessao"));
}
