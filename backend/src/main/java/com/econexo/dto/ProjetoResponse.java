package com.econexo.dto;

import com.econexo.model.Projeto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Projeto como a API devolve.
 *
 * Existe porque ProjetoController respondia com a entidade JPA — e a entidade
 * carrega `criador`, um Usuario inteiro. Serializado, isso arrastava junto os
 * dados do dono do projeto para dentro da listagem pública de projetos.
 * Aqui o criador aparece como ProfissionalResponse: nome e região, nada mais.
 */
public record ProjetoResponse(
        Integer idProjeto,
        ProfissionalResponse criador,
        String titulo,
        String descricao,
        String tipoProjeto,
        String status,
        LocalDate dataInicio,
        LocalDate dataFim,
        String cidade,
        String estado,
        BigDecimal potenciaKwp
) {

    public static ProjetoResponse de(Projeto projeto) {
        return new ProjetoResponse(
                projeto.getIdProjeto(),
                projeto.getCriador() == null
                        ? null
                        : ProfissionalResponse.de(projeto.getCriador()),
                projeto.getTitulo(),
                projeto.getDescricao(),
                projeto.getTipoProjeto(),
                projeto.getStatus(),
                projeto.getDataInicio(),
                projeto.getDataFim(),
                projeto.getCidade(),
                projeto.getEstado(),
                projeto.getPotenciaKwp()
        );
    }
}
