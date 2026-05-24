package com.econexo.service;

import com.econexo.model.Projeto;
import com.econexo.repository.ProjetoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjetoService {
    @Autowired
    private ProjetoRepository repository;

    public List<Projeto> listarTodos() { return repository.findAll(); }
    public Projeto salvar(Projeto projeto) { return repository.save(projeto); }
    public void deletar(Integer id) { repository.deleteById(id); }
}
