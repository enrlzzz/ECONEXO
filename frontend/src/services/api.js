// Em dev: proxy do Vite encaminha /api para localhost:8080
// Em prod: VITE_API_URL aponta para a API no Render (domínio separado da Hostinger)
import { obterIdToken, sair } from "../auth/sessao";

const API_HOST = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const BASE_URL = `${API_HOST}/api`;

// Rotas públicas: um 401 aqui significa "credencial errada", não "sessão
// expirada" — não faz sentido deslogar e redirecionar quem está tentando entrar.
function ehRotaPublica(path, method) {
  if (path.startsWith("/auth/")) return true;
  if (path === "/economia/analisar") return true;
  return path === "/usuarios" && method === "POST";
}

let apiAquecida = false;

/**
 * Acorda a API sem esperar ninguém clicar em nada.
 *
 * O backend roda no plano gratuito do Render, que desliga a instância após
 * ~15 min sem tráfego; religar leva 1 a 1,5 min. Chamamos isto quando a
 * pessoa abre a home ou a tela de login: enquanto ela digita e-mail e senha
 * o servidor já está subindo, e o clique em "Entrar" não paga o boot inteiro.
 *
 * mode "no-cors" porque só importa que a requisição CHEGUE — a resposta é
 * descartada, e assim o navegador não reclama de CORS no console.
 */
export function aquecerApi() {
  // Em dev o proxy do Vite aponta para o backend local: nada a acordar.
  if (!API_HOST || apiAquecida) return;
  apiAquecida = true;
  fetch(`${API_HOST}/health`, { method: "GET", mode: "no-cors", cache: "no-store" }).catch(() => {});
}

async function request(path, { method = "GET", body, params, headers } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }

  const fetchUrl = API_HOST ? url.toString() : url.pathname + url.search;

  // ID token do Firebase. O SDK renova sozinho quando está perto de
  // expirar (1 h), então pedir a cada chamada não custa rede à toa.
  const token = await obterIdToken();

  const response = await fetch(fetchUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // O backend exige "Authorization: Bearer <token>" em tudo que não seja
      // cadastro ou a análise pública.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await lerCorpo(response);

    // Token expirado ou inválido: encerra a sessão. E só manda para o login
    // quando a pessoa está na ÁREA LOGADA. Na home pública (onde um visitante
    // sem conta pode clicar em "Analisar minha conta") um 401 não é "sessão
    // caiu" — é "entre para usar", e quem trata isso é a própria tela. Antes
    // qualquer 401 jogava o visitante no /login sem explicação.
    if (response.status === 401 && !ehRotaPublica(path, method)) {
      await sair();
      if (/^\/(menu-user|perfil)/.test(window.location.pathname)) {
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

  // Sem corpo JSON não há mensagem da aplicação — é o proxy, o Render
  // hibernando ou a rede. Antes isto virava a string "Erro 502" exibida
  // literalmente em quatro telas, que não diz nada a quem está do outro
  // lado. O status continua em err.status para quem precisa dele no código.
  if (response.status >= 500) {
    return "O servidor não respondeu. Tente de novo em alguns instantes.";
  }
  if (response.status === 404) {
    return "Não encontramos o que você procurava.";
  }
  return "Não foi possível completar a ação agora. Tente de novo.";
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
