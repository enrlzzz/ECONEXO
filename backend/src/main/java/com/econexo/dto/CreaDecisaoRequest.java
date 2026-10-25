package com.econexo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreaDecisaoRequest(

        @NotNull(message = "Informe se a credencial foi aprovada")
        Boolean aprovada,

        @Size(max = 255, message = "Observação deve ter no máximo 255 caracteres")
        String observacao
) {}
