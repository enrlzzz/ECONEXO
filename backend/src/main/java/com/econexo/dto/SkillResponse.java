package com.econexo.dto;

import com.econexo.model.Skill;

/** Catálogo de habilidades. Não tem dono nem dado pessoal. */
public record SkillResponse(Integer idSkill, String nomeSkill, String categoria) {

    public static SkillResponse de(Skill skill) {
        return new SkillResponse(skill.getIdSkill(), skill.getNomeSkill(), skill.getCategoria());
    }
}
