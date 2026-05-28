package com.econexo.service;

import com.econexo.model.Formacao;
import com.econexo.repository.FormacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FormacaoService {
    @Autowired
    private FormacaoRepository repository;

    public List<Formacao> listarTodas() { return repository.findAll(); }
    public Formacao salvar(Formacao formacao) { return repository.save(formacao); }
}
