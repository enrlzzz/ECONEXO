package com.econexo.controller;

import com.econexo.model.Skill;
import com.econexo.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin(origins = "*")
public class SkillController {
    @Autowired
    private SkillService service;

    @GetMapping
    public List<Skill> listarTodas() { return service.listarTodas(); }

    @PostMapping
    public Skill salvar(@RequestBody Skill skill) { return service.salvar(skill); }
}
