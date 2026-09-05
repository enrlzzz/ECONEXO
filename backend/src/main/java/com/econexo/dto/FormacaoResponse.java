package com.econexo.dto;

import com.econexo.model.Formacao;

import java.time.LocalDate;

/**
 * Formação acadêmica. O dono aparece como ProfissionalResponse — antes a
 * entidade JPA arrastava o Usuario inteiro serializado junto.
 */
public record FormacaoResponse(
        Integer idFormacao,
        ProfissionalResponse usuario,
        String instituicao,
        String diploma,
        LocalDate dataInicio,
        LocalDate dataFim
) {

    public static FormacaoResponse de(Formacao formacao) {
        return new FormacaoResponse(
                formacao.getIdFormacao(),
                formacao.getUsuario() == null
                        ? null
                        : ProfissionalResponse.de(formacao.getUsuario()),
                formacao.getInstituicao(),
                formacao.getDiploma(),
                formacao.getDataInicio(),
                formacao.getDataFim()
        );
    }
}
