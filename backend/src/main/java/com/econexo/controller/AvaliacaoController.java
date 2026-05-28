package com.econexo.controller;

import com.econexo.model.Avaliacao;
import com.econexo.service.AvaliacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes")
@CrossOrigin(origins = "*")
public class AvaliacaoController {
    @Autowired
    private AvaliacaoService service;

    @GetMapping
    public List<Avaliacao> listarTodas() { return service.listarTodas(); }

    @PostMapping
    public Avaliacao salvar(@RequestBody Avaliacao avaliacao) { return service.salvar(avaliacao); }
}
