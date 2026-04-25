package com.econexo.controller;

import com.econexo.model.Projeto;
import com.econexo.service.ProjetoService;
import java.util.List;

/**
 * Controller para endpoints de Projeto.
 */
public class ProjetoController {

    private ProjetoService projetoService;

    public ProjetoController(ProjetoService projetoService) {
        this.projetoService = projetoService;
    }

    /** POST /api/projetos */
    public Projeto criarProjeto(Projeto projeto) {
        return projetoService.criarProjeto(projeto);
    }

    /** GET /api/projetos/{id} */
    public Projeto buscarPorId(Integer id) {
        return projetoService.buscarPorId(id);
    }

    /** GET /api/projetos/criador/{idCriador} */
    public List<Projeto> buscarPorCriador(Integer idCriador) {
        return projetoService.buscarPorCriador(idCriador);
    }

    /** GET /api/projetos/status/{status} */
    public List<Projeto> buscarPorStatus(String status) {
        return projetoService.buscarPorStatus(status);
    }

    /** GET /api/projetos/tipo/{tipo} */
    public List<Projeto> buscarPorTipo(String tipo) {
        return projetoService.buscarPorTipo(tipo);
    }

    /** GET /api/projetos */
    public List<Projeto> listarTodos() {
        return projetoService.listarTodos();
    }

    /** PUT /api/projetos/{id} */
    public Projeto atualizarProjeto(Integer id, Projeto projeto) {
        projeto.setIdProjeto(id);
        return projetoService.atualizarProjeto(projeto);
    }

    /** PUT /api/projetos/{id}/concluir */
    public Projeto concluirProjeto(Integer id) {
        return projetoService.concluirProjeto(id);
    }

    /** DELETE /api/projetos/{id} */
    public void deletarProjeto(Integer id) {
        projetoService.deletarProjeto(id);
    }
}
