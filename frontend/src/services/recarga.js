import { api } from "./api";

/**
 * Pontos de recarga de veículos elétricos (Open Charge Map).
 *
 * A chave da OCM fica no backend; aqui só chamamos a nossa API, que já
 * devolve os pontos filtrados e em cache.
 */
export const recargaService = {
  pontos: () => api.get("/recarga/pontos"),
};
