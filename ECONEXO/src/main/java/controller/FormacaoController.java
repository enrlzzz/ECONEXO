package controller;

import com.econexo.model.Formacao;
import com.econexo.service.FormacaoService;
import java.util.List;

/**
 * Controller para gerenciar endpoints de Formacao
 */
public class FormacaoController {
    
    private FormacaoService formacaoService;
    
    public FormacaoController(FormacaoService formacaoService) {
        this.formacaoService = formacaoService;
    }
    
    /**
     * POST /api/formacoes
     * Cria uma nova formação
     */
    public Formacao criarFormacao(Formacao formacao) {
        return formacaoService.criarFormacao(formacao);
    }
    
    /**
     * GET /api/formacoes/{id}
     * Busca formação por ID
     */
    public Formacao buscarPorId(Integer id) {
        return formacaoService.buscarPorId(id);
    }
    
    /**
     * GET /api/formacoes/usuario/{idUsuario}
     * Lista formações de um usuário
     */
    public List<Formacao> buscarPorUsuario(Integer idUsuario) {
        return formacaoService.buscarPorUsuario(idUsuario);
    }
    
    /**
     * GET /api/formacoes
     * Lista todas as formações
     */
    public List<Formacao> listarTodas() {
        return formacaoService.listarTodas();
    }
    
    /**
     * PUT /api/formacoes/{id}
     * Atualiza formação
     */
    public Formacao atualizarFormacao(Integer id, Formacao formacao) {
        formacao.setIdFormacao(id);
        return formacaoService.atualizarFormacao(formacao);
    }
    
    /**
     * DELETE /api/formacoes/{id}
     * Deleta formação
     */
    public void deletarFormacao(Integer id) {
        formacaoService.deletarFormacao(id);
    }
}
