package com.econexo.dto;

/**
 * Resposta de POST /api/auth/firebase. Não há token aqui: a credencial é o
 * próprio ID token do Firebase, que o front já tem.
 *
 * @param novo true quando o cadastro acabou de ser criado nesta chamada
 */
public record FirebaseSessaoResponse(UsuarioResponse usuario, boolean novo) {
}
