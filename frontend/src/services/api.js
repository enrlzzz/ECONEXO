// Em dev: proxy do Vite encaminha /api para localhost:8080
// Em prod: nginx do VPS encaminha /api para o Spring Boot no mesmo domínio
// Se um dia o frontend for hospedado em domínio separado do backend,
// defina VITE_API_URL=https://api.seudominio.com e os requests viram absolutos.
const API_HOST = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const BASE_URL = `${API_HOST}/api`;

async function request(path, { method = "GET", body, params, headers } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
  }

  const fetchUrl = API_HOST ? url.toString() : url.pathname + url.search;

  const response = await fetch(fetchUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const err = new Error(
      `HTTP ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`,
    );
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
