package com.econexo.dto;

import java.math.BigDecimal;

/**
 * Números de uma conta, como a IA leu. Qualquer campo pode vir nulo quando o
 * dado não aparece na conta — a IA é instruída a não inventar.
 *
 * @param referencia mês de referência, "MM/AAAA"
 */
public record MesConta(String referencia, BigDecimal consumoKwh, BigDecimal valorReais) {
}
