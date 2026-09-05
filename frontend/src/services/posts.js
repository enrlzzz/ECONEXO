// Timeline — dados reais da API.
//
// Antes isto vivia no localStorage, pré-carregado com posts de exemplo. O
// efeito colateral era pior do que "dado falso": cada navegador tinha a
// própria cópia, então publicar não compartilhava nada com ninguém. Agora a
// timeline é a mesma para todo mundo porque é a mesma tabela.

import { api } from "./api";

export const postsService = {
  /** Timeline completa, mais recente primeiro. Vazia se ninguém publicou. */
  listar: () => api.get("/posts"),

  criar: (texto) => api.post("/posts", { texto }),

  /**
   * Curtir/descurtir. Devolve o post já atualizado — o total vem do banco,
   * não de um contador que o front tenta adivinhar.
   */
  alternarCurtida: (idPost) => api.post(`/posts/${idPost}/curtida`),

  comentar: (idPost, texto) => api.post(`/posts/${idPost}/comentarios`, { texto }),

  excluir: (idPost) => api.delete(`/posts/${idPost}`),
};
