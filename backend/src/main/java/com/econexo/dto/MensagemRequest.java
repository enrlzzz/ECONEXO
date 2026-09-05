package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MensagemRequest(

        @NotNull(message = "Destinatário é obrigatório")
        Integer destinatarioId,

        @NotBlank(message = "A mensagem não pode ficar vazia")
        @Size(max = 2000, message = "A mensagem deve ter no máximo 2000 caracteres")
        String texto
) {
}
