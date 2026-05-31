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

export function persistUser(usuario) {
  if (!usuario) return;
  const id = String(usuario.idUsuario ?? usuario.id ?? "");
  localStorage.setItem("userId", id);
  localStorage.setItem("userName", usuario.nome ?? "");
  localStorage.setItem("userEmail", usuario.email ?? "");
  localStorage.setItem("userCidade", usuario.cidade ?? "");
  localStorage.setItem("userEstado", usuario.estado ?? "");
  localStorage.setItem("userRole", usuario.role ?? "Profissional");
  localStorage.setItem("userInitials", getInitials(usuario.nome));
  localStorage.setItem("userColor", colorFor(id || usuario.email || usuario.nome));
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
    role: localStorage.getItem("userRole") || "Profissional",
    initials: localStorage.getItem("userInitials") || getInitials(nome),
    color: localStorage.getItem("userColor") || colorFor(id),
  };
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("userId"));
}

export function logout() {
  [
    "userId",
    "userName",
    "userEmail",
    "userCidade",
    "userEstado",
    "userRole",
    "userInitials",
    "userColor",
  ].forEach((k) => localStorage.removeItem(k));
}
