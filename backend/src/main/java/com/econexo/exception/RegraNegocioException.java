package com.econexo.exception;

/** Erro esperado de regra de negócio — vira 400/409 com mensagem segura. */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
