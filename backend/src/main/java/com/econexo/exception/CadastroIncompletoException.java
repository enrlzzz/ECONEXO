package com.econexo.exception;

/**
 * A conta existe no Firebase mas ainda não tem cadastro aqui, e o pedido não
 * trouxe o que falta (nome e consentimento LGPD). Vira 428: o front entende
 * que precisa mostrar o formulário de conclusão do cadastro.
 */
public class CadastroIncompletoException extends RuntimeException {
    public CadastroIncompletoException(String mensagem) {
        super(mensagem);
    }
}
