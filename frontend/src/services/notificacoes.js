import { api } from "./api";

export const notificacoesService = {
  listar: () => api.get("/notificacoes"),
  /** { total } — alimenta o contador do sino. */
  naoLidas: () => api.get("/notificacoes/nao-lidas"),
  marcarLidas: () => api.post("/notificacoes/lidas"),
  marcarLida: (id) => api.post(`/notificacoes/${id}/lida`),
};
