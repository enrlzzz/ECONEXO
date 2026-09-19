import { api } from "./api";
export const notificacoesService = { listar: () => api.get("/notificacoes"), marcarLidas: () => api.post("/notificacoes/lidas") };
