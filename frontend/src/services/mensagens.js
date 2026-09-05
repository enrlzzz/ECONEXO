// Mensagens diretas — dados reais da API.
//
// A versão anterior guardava conversas no localStorage e, 1,5 s depois de
// cada envio, injetava uma "resposta" sorteada de uma lista fixa. Parecia que
// havia alguém do outro lado. Não havia. Agora uma conversa só existe se duas
// pessoas reais trocaram mensagens.

import { api } from "./api";

export const mensagensService = {
  /** Conversas agrupadas por interlocutor. Lista vazia é resposta legítima. */
  listar: () => api.get("/mensagens"),

  conversaCom: (idOutro) => api.get(`/mensagens/${idOutro}`),

  enviar: (destinatarioId, texto) =>
    api.post("/mensagens", { destinatarioId, texto }),

  marcarComoLida: (idOutro) => api.post(`/mensagens/${idOutro}/lida`),
};
