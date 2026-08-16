package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Credenciais do login, no CORPO da requisição.
 *
 * Antes eram @RequestParam, ou seja, a senha viajava na query string
 * (POST /api/usuarios/login?email=..&senha=..) e acabava gravada em log do
 * Render, em log de proxy e no histórico do navegador — em texto puro, em
 * disco de terceiros. No corpo, some dos logs.
 */
public record LoginRequest(

        @NotBlank(message = "E-mail é obrigatório")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        String senha
) {
}
