package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Sem campo de id: quem decide o id é o banco, não o cliente. */
public record SkillRequest(

        @NotBlank(message = "Nome da habilidade é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nomeSkill,

        @Size(max = 100, message = "Categoria deve ter no máximo 100 caracteres")
        String categoria
) {
}
