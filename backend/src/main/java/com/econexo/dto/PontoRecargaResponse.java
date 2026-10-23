package com.econexo.dto;

import java.util.List;

/**
 * Um ponto de recarga, já no formato que o mapa consome.
 *
 * Não repassamos o JSON cru da Open Charge Map: ele traz dezenas de campos
 * (contato do operador, comentários de usuários, metadados internos) que a
 * tela não usa e que não temos como garantir daqui.
 */
public record PontoRecargaResponse(
        long id,
        String nome,
        String endereco,
        double lat,
        double lng,
        String operadora,
        /** "OPERACIONAL", "FORA_DO_AR" ou "DESCONHECIDO" — nunca presumimos disponibilidade. */
        String status,
        Integer quantidadePontos,
        String custo,
        List<Conector> conectores
) {
    public record Conector(String tipo, Double potenciaKw, String corrente) {}
}
