package com.econexo.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Uma conversa é derivada: o par de usuários agrupado, não uma tabela.
 * `naoLidas` conta só o que chegou PARA quem está pedindo.
 */
public record ConversaResponse(
        ProfissionalResponse participante,
        String ultimaMensagem,
        LocalDateTime ultimaEm,
        long naoLidas,
        List<MensagemResponse> mensagens
) {
}
