package com.econexo.dto;

import com.econexo.model.PostComentario;

import java.time.LocalDateTime;

public record ComentarioResponse(
        Integer idComentario,
        ProfissionalResponse autor,
        String texto,
        LocalDateTime criadoEm
) {

    public static ComentarioResponse de(PostComentario comentario) {
        return new ComentarioResponse(
                comentario.getIdComentario(),
                ProfissionalResponse.de(comentario.getAutor()),
                comentario.getTexto(),
                comentario.getCriadoEm()
        );
    }
}
