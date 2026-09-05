// Busca de profissionais reais cadastrados.
//
// Substitui os arrays fixos "João Santos / Pedro Costa / Roberto Lima" que a
// tela de busca exibia. Devolve ProfissionalResponse: id, nome, cidade,
// estado e tipo — sem e-mail nem telefone de terceiros.

import { api } from "./api";

export const profissionaisService = {
  /**
   * Filtros vazios são ignorados pelo backend; sem nenhum, lista todos os
   * cadastrados. Se ninguém se cadastrou ainda, volta [].
   */
  buscar: ({ nome, cidade, estado, tipo } = {}) =>
    api.get("/usuarios/busca", {
      params: {
        nome: nome || undefined,
        cidade: cidade || undefined,
        estado: estado || undefined,
        tipo: tipo || undefined,
      },
    }),
};
