package com.econexo.dto;

/**
 * Resposta do login: o token e o mínimo que a interface precisa para
 * montar o cabeçalho. Sem senha, sem CPF.
 */
public record LoginResponse(
        String token,
        long expiraEmSegundos,
        UsuarioResponse usuario
) {
}
