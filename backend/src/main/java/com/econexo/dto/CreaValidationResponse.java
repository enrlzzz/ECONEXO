package com.econexo.dto;

/**
 * Situação da credencial CREA de um usuário.
 *
 * status: NAO_VINCULADA, PENDENTE, VERIFICADA ou REJEITADA.
 * fonte: página do conselho da UF, onde qualquer pessoa confere o registro.
 */
public record CreaValidationResponse(String status, String mensagem, String fonte, String registro, String uf) {}
