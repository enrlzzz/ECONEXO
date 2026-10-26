package com.econexo.dto;

/**
 * Cartão de um profissional na tela de busca: o cartão público mais a
 * reputação e o selo de CREA, para o resultado já dizer em quem confiar.
 *
 * Mesma regra do ProfissionalResponse: sem e-mail, telefone ou CPF.
 *
 * mediaAvaliacoes é null quando ainda não há avaliação — a tela mostra
 * "sem avaliações", não "0,0", porque zero estrelas seria uma nota.
 */
public record ProfissionalBuscaResponse(
        Integer idUsuario,
        String nome,
        String cidade,
        String estado,
        String tipoProfissional,
        Double mediaAvaliacoes,
        long totalAvaliacoes,
        boolean creaVerificado
) {}
