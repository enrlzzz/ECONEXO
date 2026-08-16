// Em dev: proxy do Vite encaminha /api para localhost:8080
// Em prod: VITE_API_URL aponta para a API no Render (domínio separado da Hostinger)
import { getToken, logout } from "../userSession";

const API_HOST = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const BASE_URL = `${API_HOST}/api`;

// Rotas públicas: um 401 aqui significa "credencial errada", não "sessão
// expirada" — não faz sentido deslogar e redirecionar quem está tentando entrar.
function ehRotaPublica(path, method) {
  if (path.startsWith("/auth/login")) return true;
  return path === "/usuarios" && method === "POST";
}

async function request(path, { method = "GET", body, params, headers } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }

  const fetchUrl = API_HOST ? url.toString() : url.pathname + url.search;

  const token = getToken();

  const response = await fetch(fetchUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // O backend exige "Authorization: Bearer <token>" em tudo que não seja
      // login ou cadastro.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await lerCorpo(response);

    // Token expirado ou inválido numa rota protegida: encerra a sessão e
    // manda para o login, em vez de deixar a interface quebrada mostrando erro.
    if (response.status === 401 && !ehRotaPublica(path, method)) {
      logout();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    const err = new Error(mensagemDe(payload, response));
    err.status = response.status;
    err.campos = payload?.campos;
    throw err;
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

async function lerCorpo(response) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return await response.json();
    const texto = await response.text();
    return texto ? { mensagem: texto } : null;
  } catch {
    return null;
  }
}

/**
 * A API responde erro num formato único ({status, erro, mensagem, campos}).
 * Preferimos a mensagem dela; o texto cru só aparece se algo muito
 * inesperado acontecer (ex.: 502 do proxy, que não é JSON da aplicação).
 */
function mensagemDe(payload, response) {
  if (payload?.campos) {
    const primeiro = Object.values(payload.campos)[0];
    if (primeiro) return primeiro;
  }
  if (payload?.mensagem) return payload.mensagem;
  return `Erro ${response.status}`;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
