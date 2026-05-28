package com.econexo.controller;

import com.econexo.model.Projeto;
import com.econexo.service.ProjetoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projetos")
public class ProjetoController {
    @Autowired
    private ProjetoService service;

    @GetMapping
    public List<Projeto> listarTodos() { return service.listarTodos(); }

    @PostMapping
    public Projeto salvar(@RequestBody Projeto projeto) { return service.salvar(projeto); }
}
