package com.econexo.dto;

import com.econexo.model.Usuario;

import java.time.LocalDate;

/**
 * Tudo que a API devolve sobre o PRÓPRIO usuário (login, /me, edição).
 *
 * Para terceiros existe ProfissionalResponse, que não tem e-mail nem
 * telefone. Antes GET /api/usuarios devolvia este record para a base inteira,
 * entregando o e-mail de todo mundo a qualquer pessoa logada.
 *
 * REGRA: senha e CPF NUNCA aparecem aqui. Não adicione.
 *
 * Antes deste record os controllers devolviam a entidade JPA serializada, e
 * GET /api/usuarios expunha a base inteira — senha e CPF de todo mundo — sem
 * pedir autenticação. Enquanto a API responder só com DTOs, esse tipo de
 * vazamento não volta por acidente.
 */
public record UsuarioResponse(
        Integer idUsuario,
        String nome,
        String email,
        String telefone,
        LocalDate dataNascimento,
        String cidade,
        String estado,
        String tipoProfissional,
        boolean admin
) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getDataNascimento(),
                usuario.getCidade(),
                usuario.getEstado(),
                usuario.getTipoProfissional(),
                usuario.getAdmin()
        );
    }
}
