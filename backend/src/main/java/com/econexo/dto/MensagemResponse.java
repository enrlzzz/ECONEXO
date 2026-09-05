package com.econexo.dto;

import com.econexo.model.Mensagem;

import java.time.LocalDateTime;

public record MensagemResponse(
        Integer idMensagem,
        Integer remetenteId,
        Integer destinatarioId,
        String texto,
        LocalDateTime criadoEm,
        boolean lida
) {

    public static MensagemResponse de(Mensagem mensagem) {
        return new MensagemResponse(
                mensagem.getIdMensagem(),
                mensagem.getRemetente().getIdUsuario(),
                mensagem.getDestinatario().getIdUsuario(),
                mensagem.getTexto(),
                mensagem.getCriadoEm(),
                mensagem.getLidaEm() != null
        );
    }
}
