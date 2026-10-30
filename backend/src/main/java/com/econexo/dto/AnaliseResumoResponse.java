package com.econexo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Linha do histórico de análises no perfil. */
public record AnaliseResumoResponse(
        Integer id,
        LocalDateTime criadaEm,
        String resumo,
        String periodo,
        BigDecimal consumoMedioKwh,
        BigDecimal valorMedio
) {
}
