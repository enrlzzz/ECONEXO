package com.econexo.dto;

import com.econexo.model.Usuario;

/**
 * Cartão público de um profissional, usado na busca e como autor de post
 * ou participante de conversa.
 *
 * Deliberadamente MENOR que UsuarioResponse: sem e-mail, sem telefone, sem
 * data de nascimento. Esta listagem é visível para qualquer usuário logado —
 * devolver contato de terceiros aqui transformaria a busca num raspador de
 * e-mails da base. Quem precisa falar com alguém usa /api/mensagens.
 */
public record ProfissionalResponse(
        Integer idUsuario,
        String nome,
        String cidade,
        String estado,
        String tipoProfissional
) {

    public static ProfissionalResponse de(Usuario usuario) {
        return new ProfissionalResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getCidade(),
                usuario.getEstado(),
                usuario.getTipoProfissional()
        );
    }
}
