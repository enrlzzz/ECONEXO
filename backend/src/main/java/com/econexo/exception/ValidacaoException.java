package com.econexo.exception;

/** Dado inválido detectado fora do Bean Validation. Vira 400. */
public class ValidacaoException extends RuntimeException {
    public ValidacaoException(String mensagem) {
        super(mensagem);
    }
}
