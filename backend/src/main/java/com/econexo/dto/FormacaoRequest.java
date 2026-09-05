package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** Sem campo de usuário: a formação é sempre de quem está autenticado. */
public record FormacaoRequest(

        @NotBlank(message = "Instituição é obrigatória")
        @Size(max = 150, message = "Instituição deve ter no máximo 150 caracteres")
        String instituicao,

        @Size(max = 100, message = "Diploma deve ter no máximo 100 caracteres")
        String diploma,

        LocalDate dataInicio,
        LocalDate dataFim
) {
}
