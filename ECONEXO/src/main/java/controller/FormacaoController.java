package com.econexo.controller;

import com.econexo.model.Formacao;
import com.econexo.service.FormacaoService;
import java.util.List;

/**
 * Controller para endpoints de Formacao.
 */
public class FormacaoController {

    private FormacaoService formacaoService;

    public FormacaoController(FormacaoService formacaoService) {
        this.formacaoService = formacaoService;
    }

    /** POST /api/formacoes */
    public Formacao criarFormacao(Formacao formacao) {
        return formacaoService.criarFormacao(formacao);
    }

    /** GET /api/formacoes/{id} */
    public Formacao buscarPorId(Integer id) {
        return formacaoService.buscarPorId(id);
    }

    /** GET /api/formacoes/usuario/{idUsuario} */
    public List<Formacao> buscarPorUsuario(Integer idUsuario) {
        return formacaoService.buscarPorUsuario(idUsuario);
    }

    /** GET /api/formacoes */
    public List<Formacao> listarTodas() {
        return formacaoService.listarTodas();
    }

    /** PUT /api/formacoes/{id} */
    public Formacao atualizarFormacao(Integer id, Formacao formacao) {
        formacao.setIdFormacao(id);
        return formacaoService.atualizarFormacao(formacao);
    }

    /** DELETE /api/formacoes/{id} */
    public void deletarFormacao(Integer id) {
        formacaoService.deletarFormacao(id);
    }
}
