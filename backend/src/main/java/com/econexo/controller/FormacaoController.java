package com.econexo.controller;

import com.econexo.model.Formacao;
import com.econexo.service.FormacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/formacoes")
public class FormacaoController {
    @Autowired
    private FormacaoService service;

    @GetMapping
    public List<Formacao> listarTodas() { return service.listarTodas(); }

    @PostMapping
    public Formacao salvar(@RequestBody Formacao formacao) { return service.salvar(formacao); }
}
