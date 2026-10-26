import { api } from "./api";

/**
 * Busca pontos de recarga próximos às coordenadas via backend (proxy OCM).
 *
 * @param {number} lat  - latitude
 * @param {number} lng  - longitude
 * @param {number} raio - raio em km (1–100)
 */
export function buscarPontosRecarga(lat, lng, raio = 30) {
  return api.get("/pontos-recarga", { params: { lat, lng, raio } });
}
