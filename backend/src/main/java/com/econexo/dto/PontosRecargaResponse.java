package com.econexo.dto;

import java.time.Instant;
import java.util.List;

/**
 * Envelope da listagem. {@code disponivel=false} é o caso "serviço sem chave
 * ou fora do ar": a tela mostra a {@code mensagem} em vez de um mapa vazio
 * que pareceria "não há carregadores em Sorocaba".
 */
public record PontosRecargaResponse(
        boolean disponivel,
        String mensagem,
        String fonte,
        Instant atualizadoEm,
        List<PontoRecargaResponse> pontos
) {
    public static PontosRecargaResponse indisponivel(String mensagem) {
        return new PontosRecargaResponse(false, mensagem, "Open Charge Map", null, List.of());
    }
}
