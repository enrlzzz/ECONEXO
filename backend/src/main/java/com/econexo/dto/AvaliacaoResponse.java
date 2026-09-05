package com.econexo.dto;

import com.econexo.model.Avaliacao;

/**
 * Avaliação de um profissional por outro.
 *
 * Avaliador e avaliado vêm como ProfissionalResponse — a entidade JPA
 * serializava dois Usuario inteiros mais o Projeto em cada item da lista.
 */
public record AvaliacaoResponse(
        Integer idAvaliacao,
        Integer projetoId,
        ProfissionalResponse avaliador,
        ProfissionalResponse avaliado,
        Integer estrelas,
        String comentario
) {

    public static AvaliacaoResponse de(Avaliacao a) {
        return new AvaliacaoResponse(
                a.getIdAvaliacao(),
                a.getProjeto() == null ? null : a.getProjeto().getIdProjeto(),
                a.getAvaliador() == null ? null : ProfissionalResponse.de(a.getAvaliador()),
                a.getAvaliado() == null ? null : ProfissionalResponse.de(a.getAvaliado()),
                a.getEstrelas(),
                a.getComentario()
        );
    }
}
