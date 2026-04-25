package com.econexo.controller;

import com.econexo.model.Skill;
import com.econexo.service.SkillService;
import java.util.List;

/**
 * Controller para gerenciar endpoints de Skill
 */
public class SkillController {
    
    private SkillService skillService;
    
    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }
    
    /**
     * POST /api/skills
     * Cria uma nova skill
     */
    public Skill criarSkill(Skill skill) {
        return skillService.criarSkill(skill);
    }
    
    /**
     * GET /api/skills/{id}
     * Busca skill por ID
     */
    public Skill buscarPorId(Integer id) {
        return skillService.buscarPorId(id);
    }
    
    /**
     * GET /api/skills/nome/{nome}
     * Busca skill por nome
     */
    public Skill buscarPorNome(String nome) {
        return skillService.buscarPorNome(nome);
    }
    
    /**
     * GET /api/skills/categoria/{categoria}
     * Busca skills por categoria
     */
    public List<Skill> buscarPorCategoria(String categoria) {
        return skillService.buscarPorCategoria(categoria);
    }
    
    /**
     * GET /api/skills
     * Lista todas as skills
     */
    public List<Skill> listarTodas() {
        return skillService.listarTodas();
    }
    
    /**
     * PUT /api/skills/{id}
     * Atualiza skill
     */
    public Skill atualizarSkill(Integer id, Skill skill) {
        skill.setIdSkill(id);
        return skillService.atualizarSkill(skill);
    }
    
    /**
     * DELETE /api/skills/{id}
     * Deleta skill
     */
    public void deletarSkill(Integer id) {
        skillService.deletarSkill(id);
    }
}
