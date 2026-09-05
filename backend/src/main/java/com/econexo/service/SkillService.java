package com.econexo.service;

import com.econexo.dto.SkillRequest;
import com.econexo.dto.SkillResponse;
import com.econexo.model.Skill;
import com.econexo.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository repository;

    public SkillService(SkillRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> listarTodas() {
        return repository.findAll().stream().map(SkillResponse::de).toList();
    }

    @Transactional
    public SkillResponse salvar(SkillRequest req) {
        Skill skill = new Skill();
        skill.setNomeSkill(req.nomeSkill().trim());
        skill.setCategoria(req.categoria());
        return SkillResponse.de(repository.save(skill));
    }

    @Transactional
    public void deletar(Integer id) {
        repository.deleteById(id);
    }
}
