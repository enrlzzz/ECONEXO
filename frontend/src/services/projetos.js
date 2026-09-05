// Projetos publicados — dados reais da API.
//
// A tela de Projetos mantinha a lista em useState, começando com um exemplo
// fixo ("Sistema Comercial 15kWp"): publicar acrescentava um item que sumia
// no primeiro F5. Agora vai para a tabela `projeto`.

import { api } from "./api";

export const projetosService = {
  listar: () => api.get("/projetos"),

  criar: (projeto) => api.post("/projetos", projeto),

  excluir: (id) => api.delete(`/projetos/${id}`),
};
