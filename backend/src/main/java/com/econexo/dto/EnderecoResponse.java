package com.econexo.dto;

import com.econexo.model.Endereco;

/**
 * Endereço — devolvido APENAS ao próprio dono (ver EnderecoService).
 *
 * O controller anterior respondia com a entidade JPA em GET /api/enderecos
 * sem filtro nenhum: qualquer usuário logado recebia CEP, logradouro, número,
 * latitude e longitude de TODA a base. É endereço residencial de pessoa
 * física — dado pessoal sob a LGPD, e o tipo de vazamento que permite
 * localizar fisicamente qualquer usuário da plataforma.
 *
 * Note que o dono não vai no corpo: se você recebeu, é seu.
 */
public record EnderecoResponse(
        Integer idEndereco,
        String cep,
        String cidade,
        String estado,
        String logradouro,
        String numero,
        Float latitude,
        Float longitude
) {

    public static EnderecoResponse de(Endereco endereco) {
        return new EnderecoResponse(
                endereco.getIdEndereco(),
                endereco.getCep(),
                endereco.getCidade(),
                endereco.getEstado(),
                endereco.getLogradouro(),
                endereco.getNumero(),
                endereco.getLatitude(),
                endereco.getLongitude()
        );
    }
}
