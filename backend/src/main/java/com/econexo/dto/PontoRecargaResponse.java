package com.econexo.dto;

import java.util.List;

public record PontoRecargaResponse(
        Long id,
        String nome,
        String endereco,
        double latitude,
        double longitude,
        String statusOperacional,
        List<ConectorInfo> conectores
) {
    public record ConectorInfo(String tipo, int nivel, int quantidade) {}
}
