// Centraliza leitura/escrita da sessão do usuário no localStorage.
// Login persistente: enquanto houver userId, considera-se logado (o Firebase
// confirma ao carregar e limpa o cache se a sessão dele tiver acabado).

// Cores de avatar: todas com texto branco acima de 4,5:1.
const PALETTE = [
  "#0A7F4F",
  "#1D1D1F",
  "#A84B00",
  "#3A5A8C",
  "#6E4BA8",
  "#086B42",
  "#B3261E",
  "#4A5A3C",
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

// Tokens do login antigo (JWT próprio). Não são mais gravados — o login é
// pelo Firebase —, mas logout() ainda os apaga de quem vinha da versão anterior.
const CHAVES_LEGADAS = ["authToken", "authTokenExpiraEm"];

/**
 * Cache do usuário para a interface desenhar nome e avatar sem perguntar à
 * API a cada tela. NÃO é a credencial: quem autoriza é o ID token do
 * Firebase, que o SDK guarda e o api.js anexa a cada chamada.
 */
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
  return Boolean(localStorage.getItem("userId"));
}

/**
 * Também NÃO é autorização — só decide se o item do painel aparece no menu.
 * Quem autoriza é o backend, em cada endpoint administrativo.
 */
export function isAdmin() {
  return isLoggedIn() && localStorage.getItem("userAdmin") === "1";
}

/** Limpa o cache local. Para sair de verdade (Firebase também), use sair() de auth/sessao. */
export function logout() {
  [
    ...CHAVES_LEGADAS,
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
