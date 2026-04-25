package controller;

import com.econexo.model.Avaliacao;
import com.econexo.service.AvaliacaoService;
import java.util.List;

/**
 * Controller para gerenciar endpoints de Avaliacao
 */
public class AvaliacaoController {
    
    private AvaliacaoService avaliacaoService;
    
    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }
    
    /**
     * POST /api/avaliacoes
     * Cria uma nova avaliação
     */
    public Avaliacao criarAvaliacao(Avaliacao avaliacao) {
        return avaliacaoService.criarAvaliacao(avaliacao);
    }
    
    /**
     * GET /api/avaliacoes/{id}
     * Busca avaliação por ID
     */
    public Avaliacao buscarPorId(Integer id) {
        return avaliacaoService.buscarPorId(id);
    }
    
    /**
     * GET /api/avaliacoes/projeto/{idProjeto}
     * Lista avaliações de um projeto
     */
    public List<Avaliacao> buscarPorProjeto(Integer idProjeto) {
        return avaliacaoService.buscarPorProjeto(idProjeto);
    }
    
    /**
     * GET /api/avaliacoes/avaliador/{idAvaliador}
     * Lista avaliações feitas por um usuário
     */
    public List<Avaliacao> buscarAvaliacoesFeitasPor(Integer idAvaliador) {
        return avaliacaoService.buscarAvaliacoesFeitasPor(idAvaliador);
    }
    
    /**
     * GET /api/avaliacoes/avaliado/{idAvaliado}
     * Lista avaliações recebidas por um usuário
     */
    public List<Avaliacao> buscarAvaliacoesRecebidas(Integer idAvaliado) {
        return avaliacaoService.buscarAvaliacoesRecebidas(idAvaliado);
    }
    
    /**
     * GET /api/avaliacoes/media/{idUsuario}
     * Calcula média de avaliações de um usuário
     */
    public Double calcularMediaAvaliacoes(Integer idUsuario) {
        return avaliacaoService.calcularMediaAvaliacoes(idUsuario);
    }
    
    /**
     * GET /api/avaliacoes
     * Lista todas as avaliações
     */
    public List<Avaliacao> listarTodas() {
        return avaliacaoService.listarTodas();
    }
    
    /**
     * PUT /api/avaliacoes/{id}
     * Atualiza avaliação
     */
    public Avaliacao atualizarAvaliacao(Integer id, Avaliacao avaliacao) {
        avaliacao.setIdAvaliacao(id);
        return avaliacaoService.atualizarAvaliacao(avaliacao);
    }
    
    /**
     * DELETE /api/avaliacoes/{id}
     * Deleta avaliação
     */
    public void deletarAvaliacao(Integer id) {
        avaliacaoService.deletarAvaliacao(id);
    }
}
