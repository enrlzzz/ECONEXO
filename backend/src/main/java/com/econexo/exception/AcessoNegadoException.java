package com.econexo.exception;

/** Autenticado, mas mexendo em recurso que não é dele. Vira 403. */
public class AcessoNegadoException extends RuntimeException {
    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}
