package com.econexo.service;

import com.econexo.model.Avaliacao;
import com.econexo.repository.AvaliacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AvaliacaoService {
    @Autowired
    private AvaliacaoRepository repository;

    public List<Avaliacao> listarTodas() { return repository.findAll(); }
    public Avaliacao salvar(Avaliacao avaliacao) { return repository.save(avaliacao); }
}
