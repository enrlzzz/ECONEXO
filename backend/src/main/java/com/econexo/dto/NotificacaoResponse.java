package com.econexo.dto;
import com.econexo.model.Notificacao;
public record NotificacaoResponse(Integer idNotificacao, String tipo, String texto, String ator, Integer referenciaId, java.time.LocalDateTime criadoEm, boolean lida) { public static NotificacaoResponse de(Notificacao n){ return new NotificacaoResponse(n.getIdNotificacao(),n.getTipo(),n.getTexto(),n.getAtor()==null?null:n.getAtor().getNome(),n.getReferenciaId(),n.getCriadoEm(),n.isLida()); } }
