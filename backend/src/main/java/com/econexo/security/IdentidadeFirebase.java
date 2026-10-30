package com.econexo.security;

/**
 * O que o backend aproveita de um ID token do Firebase já validado.
 *
 * @param uid             identificador estável da conta no Firebase
 * @param email           e-mail da conta (pode ser nulo em provedores sem e-mail)
 * @param emailVerificado true se o Firebase confirmou que o e-mail é da pessoa
 * @param nome            nome de exibição (Google costuma preencher; e-mail/senha não)
 */
public record IdentidadeFirebase(String uid, String email, boolean emailVerificado, String nome) {
}
