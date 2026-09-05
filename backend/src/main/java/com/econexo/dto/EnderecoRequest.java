package com.econexo.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Sem campo de usuário: o dono é sempre quem está autenticado.
 * Aceitar um fk_usuario do corpo permitiria gravar endereço no cadastro alheio.
 */
public record EnderecoRequest(

        @Pattern(regexp = "^$|^\\d{5}-?\\d{3}$", message = "CEP inválido")
        String cep,

        @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
        String cidade,

        @Size(max = 50, message = "Estado deve ter no máximo 50 caracteres")
        String estado,

        @Size(max = 150, message = "Logradouro deve ter no máximo 150 caracteres")
        String logradouro,

        @Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
        String numero,

        Float latitude,
        Float longitude
) {
}
