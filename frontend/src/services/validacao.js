import { api } from "./api";

/**
 * Credencial CREA.
 *
 * O profissional PEDE a verificação (fica PENDENTE); quem aprova é um
 * administrador, depois de conferir na consulta pública do conselho.
 * Status possíveis: NAO_VINCULADA, PENDENTE, VERIFICADA, REJEITADA.
 */
export const validacaoService = {
  /** Pede a verificação do próprio registro: { nome, registro, uf }. */
  crea: (dados) => api.post("/validacoes/crea", dados),
  /** Situação da minha credencial. */
  creaMinha: () => api.get("/validacoes/crea/minha"),
  /** Fila de conferência — só administrador. */
  creaPendentes: () => api.get("/validacoes/crea/pendentes"),
  /** Aprova ou rejeita — só administrador. */
  creaDecidir: (id, aprovada, observacao) =>
    api.post(`/validacoes/crea/${id}/decisao`, { aprovada, observacao: observacao || undefined }),
};

export const reputacaoService = {
  /** Avaliações recebidas por um profissional. Sem id, as minhas. */
  listar: (usuarioId) => api.get("/avaliacoes", { params: { usuarioId } }),
  /** Avalia um profissional: { avaliadoId, estrelas (1-5), comentario? }. */
  avaliar: (dados) => api.post("/avaliacoes", dados),
};
