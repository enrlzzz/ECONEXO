package com.econexo.controller;

import com.econexo.model.Endereco;
import com.econexo.service.EnderecoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/enderecos")
@CrossOrigin(origins = "*")
public class EnderecoController {
    @Autowired
    private EnderecoService service;

    @GetMapping
    public List<Endereco> listarTodos() { return service.listarTodos(); }

    @PostMapping
    public Endereco salvar(@RequestBody Endereco endereco) { return service.salvar(endereco); }
}
