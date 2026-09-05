package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComentarioRequest(

        @NotBlank(message = "O comentário não pode ficar vazio")
        @Size(max = 1000, message = "O comentário deve ter no máximo 1000 caracteres")
        String texto
) {
}
