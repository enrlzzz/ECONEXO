package com.econexo.dto;

import java.time.LocalDateTime;

/** Item da fila do administrador. Sem e-mail, telefone ou CPF do solicitante. */
public record CreaPendenteResponse(
        Integer idCredencial,
        Integer idUsuario,
        String nomeUsuario,
        String nomeRegistro,
        String registro,
        String uf,
        String fonte,
        LocalDateTime criadoEm
) {}
