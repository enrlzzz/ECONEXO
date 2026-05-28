package com.econexo.service;

import com.econexo.model.Skill;
import com.econexo.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SkillService {
    @Autowired
    private SkillRepository repository;

    public List<Skill> listarTodas() { return repository.findAll(); }
    public Skill salvar(Skill skill) { return repository.save(skill); }
    public void deletar(Integer id) { repository.deleteById(id); }
}
