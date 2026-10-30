package com.econexo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

/**
 * Resultado da análise.
 *
 * @param analise             texto da IA, com formatação leve ("## ", "- ", **negrito**)
 * @param fonte               modelo que respondeu, ou o motivo de não haver análise
 * @param resumo              uma frase para o histórico e o título do resultado
 * @param meses               números por conta, na ordem em que vieram
 * @param economiaSolarMensal estimativa da IA, em R$ por mês
 * @param idAnalise           id no histórico; nulo para visitante (nada é salvo)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record EconomiaResponse(
        String analise,
        String fonte,
        String resumo,
        List<MesConta> meses,
        BigDecimal economiaSolarMensal,
        Integer idAnalise
) {

    /** Resposta sem dados estruturados: falha, configuração ausente etc. */
    public static EconomiaResponse soTexto(String analise, String fonte) {
        return new EconomiaResponse(analise, fonte, null, List.of(), null, null);
    }

    public boolean temAnalise() {
        return resumo != null;
    }

    public EconomiaResponse comId(Integer id) {
        return new EconomiaResponse(analise, fonte, resumo, meses, economiaSolarMensal, id);
    }
}
