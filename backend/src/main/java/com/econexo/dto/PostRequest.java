package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * O que o cliente pode enviar ao publicar.
 *
 * Não há campo de autor: quem publicou é sempre o dono do token. Aceitar um
 * autor do corpo permitiria publicar no nome de outra pessoa.
 */
public record PostRequest(

        @NotBlank(message = "O texto da publicação é obrigatório")
        @Size(max = 5000, message = "A publicação deve ter no máximo 5000 caracteres")
        String texto
) {
}
