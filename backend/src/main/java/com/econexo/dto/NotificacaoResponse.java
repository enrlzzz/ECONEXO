package com.econexo.dto;

import com.econexo.model.Notificacao;

import java.time.LocalDateTime;

/**
 * atorId permite à tela levar o usuário até quem gerou a notificação (por
 * exemplo, abrir a conversa). É o mesmo dado público do cartão do profissional.
 */
public record NotificacaoResponse(
        Integer idNotificacao,
        String tipo,
        String texto,
        String ator,
        Integer atorId,
        Integer referenciaId,
        LocalDateTime criadoEm,
        boolean lida
) {

    public static NotificacaoResponse de(Notificacao n) {
        return new NotificacaoResponse(
                n.getIdNotificacao(),
                n.getTipo(),
                n.getTexto(),
                n.getAtor() == null ? null : n.getAtor().getNome(),
                n.getAtor() == null ? null : n.getAtor().getIdUsuario(),
                n.getReferenciaId(),
                n.getCriadoEm(),
                n.isLida()
        );
    }
}
