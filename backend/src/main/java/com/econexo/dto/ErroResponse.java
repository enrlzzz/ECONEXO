package com.econexo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/**
 * Formato único de erro da API.
 *
 * Nunca carrega stack trace, SQL, nome de tabela ou versão de biblioteca —
 * isso é mapa da infraestrutura para quem está sondando o sistema.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErroResponse(
        int status,
        String erro,
        String mensagem,
        Map<String, String> campos,
        Instant momento
) {

    public static ErroResponse de(int status, String erro, String mensagem) {
        return new ErroResponse(status, erro, mensagem, null, Instant.now());
    }

    public static ErroResponse deValidacao(String mensagem, Map<String, String> campos) {
        return new ErroResponse(400, "Dados inválidos", mensagem, campos, Instant.now());
    }
}
