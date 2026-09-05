package com.econexo.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Post como a timeline precisa dele.
 *
 * `curtidoPorMim` é calculado para o usuário que está pedindo — é o que
 * permite o coração já vir preenchido sem o front adivinhar nada.
 * O autor vem como ProfissionalResponse: sem e-mail nem telefone.
 */
public record PostResponse(
        Integer idPost,
        ProfissionalResponse autor,
        String texto,
        LocalDateTime criadoEm,
        long curtidas,
        boolean curtidoPorMim,
        List<ComentarioResponse> comentarios
) {
}
