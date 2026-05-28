package com.econexo.service;

import com.econexo.model.Endereco;
import com.econexo.repository.EnderecoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EnderecoService {
    @Autowired
    private EnderecoRepository repository;

    public List<Endereco> listarTodos() { return repository.findAll(); }
    public Endereco salvar(Endereco endereco) { return repository.save(endereco); }
}
