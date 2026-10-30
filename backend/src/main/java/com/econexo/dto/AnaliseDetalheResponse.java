package com.econexo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Uma análise do histórico, completa. */
public record AnaliseDetalheResponse(
        Integer id,
        LocalDateTime criadaEm,
        String resumo,
        String analise,
        List<MesConta> meses,
        BigDecimal consumoMedioKwh,
        BigDecimal valorMedio,
        BigDecimal economiaSolarMensal
) {
}
