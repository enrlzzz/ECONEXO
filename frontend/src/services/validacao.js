import { api } from "./api";

export const validacaoService = {
  crea: (dados) => api.post("/validacoes/crea", dados),
};

export const reputacaoService = {
  listar: (usuarioId) => api.get("/avaliacoes", { params: { usuarioId } }),
};
