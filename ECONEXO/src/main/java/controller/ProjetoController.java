package com.econexo.controller;

import com.econexo.model.Projeto;
import com.econexo.service.ProjetoService;
import java.util.List;

/**
 * Controller para gerenciar endpoints de Projeto
 */
public class ProjetoController {
    
    private ProjetoService projetoService;
    
    public ProjetoController(ProjetoService projetoService) {
        this.projetoService = projetoService;
    }
    
    /**
     * POST /api/projetos
     * Cria um novo projeto
     */
    public Projeto criarProjeto(Projeto projeto) {
        return projetoService.criarProjeto(projeto);
    }
    
    /**
     * GET /api/projetos/{id}
     * Busca projeto por ID
     */
    public Projeto buscarPorId(Integer id) {
        return projetoService.buscarPorId(id);
    }
    
    /**
     * GET /api/projetos/criador/{idCriador}
     * Lista projetos por criador
     */
    public List<Projeto> buscarPorCriador(Integer idCriador) {
        return projetoService.buscarPorCriador(idCriador);
    }
    
    /**
     * GET /api/projetos/status/{status}
     * Lista projetos por status
     */
    public List<Projeto> buscarPorStatus(String status) {
        return projetoService.buscarPorStatus(status);
    }
    
    /**
     * GET /api/projetos/tipo/{tipo}
     * Lista projetos por tipo
     */
    public List<Projeto> buscarPorTipo(String tipo) {
        return projetoService.buscarPorTipo(tipo);
    }
    
    /**
     * GET /api/projetos
     * Lista todos os projetos
     */
    public List<Projeto> listarTodos() {
        return projetoService.listarTodos();
    }
    
    /**
     * PUT /api/projetos/{id}
     * Atualiza projeto
     */
    public Projeto atualizarProjeto(Integer id, Projeto projeto) {
        projeto.setIdProjeto(id);
        return projetoService.atualizarProjeto(projeto);
    }
    
    /**
     * PUT /api/projetos/{id}/concluir
     * Conclui um projeto
     */
    public Projeto concluirProjeto(Integer id) {
        return projetoService.concluirProjeto(id);
    }
    
    /**
     * DELETE /api/projetos/{id}
     * Deleta projeto
     */
    public void deletarProjeto(Integer id) {
        projetoService.deletarProjeto(id);
    }
}
