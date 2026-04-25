package com.econexo.controller;

import com.econexo.model.Avaliacao;
import com.econexo.service.AvaliacaoService;
import java.util.List;

/**
 * Controller para endpoints de Avaliacao.
 */
public class AvaliacaoController {

    private AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    /** POST /api/avaliacoes */
    public Avaliacao criarAvaliacao(Avaliacao avaliacao) {
        return avaliacaoService.criarAvaliacao(avaliacao);
    }

    /** GET /api/avaliacoes/{id} */
    public Avaliacao buscarPorId(Integer id) {
        return avaliacaoService.buscarPorId(id);
    }

    /** GET /api/avaliacoes/projeto/{idProjeto} */
    public List<Avaliacao> buscarPorProjeto(Integer idProjeto) {
        return avaliacaoService.buscarPorProjeto(idProjeto);
    }

    /** GET /api/avaliacoes/avaliador/{idAvaliador} */
    public List<Avaliacao> buscarAvaliacoesFeitasPor(Integer idAvaliador) {
        return avaliacaoService.buscarAvaliacoesFeitasPor(idAvaliador);
    }

    /** GET /api/avaliacoes/avaliado/{idAvaliado} */
    public List<Avaliacao> buscarAvaliacoesRecebidas(Integer idAvaliado) {
        return avaliacaoService.buscarAvaliacoesRecebidas(idAvaliado);
    }

    /** GET /api/avaliacoes/media/{idUsuario} */
    public Double calcularMediaAvaliacoes(Integer idUsuario) {
        return avaliacaoService.calcularMediaAvaliacoes(idUsuario);
    }

    /** GET /api/avaliacoes */
    public List<Avaliacao> listarTodas() {
        return avaliacaoService.listarTodas();
    }

    /** PUT /api/avaliacoes/{id} */
    public Avaliacao atualizarAvaliacao(Integer id, Avaliacao avaliacao) {
        avaliacao.setIdAvaliacao(id);
        return avaliacaoService.atualizarAvaliacao(avaliacao);
    }

    /** DELETE /api/avaliacoes/{id} */
    public void deletarAvaliacao(Integer id) {
        avaliacaoService.deletarAvaliacao(id);
    }
}
