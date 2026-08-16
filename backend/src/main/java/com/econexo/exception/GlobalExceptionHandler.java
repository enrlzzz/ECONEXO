package com.econexo.exception;

import com.econexo.dto.ErroResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Ponto único de tratamento de erro da API.
 *
 * Antes disto, uma exceção virava stack trace na resposta, e o api.js do
 * frontend repassava o texto inteiro. Isso entregava versão do Hibernate,
 * driver, nomes de tabela e o SQL que falhou — informação que só serve para
 * quem está mapeando o sistema para atacá-lo.
 *
 * Aqui o detalhe vai para o LOG (onde a equipe vê) e o cliente recebe uma
 * mensagem curta e sem pistas.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Bean Validation: aqui o detalhe É útil e não vaza nada de infraestrutura. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> validacao(MethodArgumentNotValidException e) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError erro : e.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(erro.getField(), erro.getDefaultMessage());
        }
        return ResponseEntity.badRequest()
                .body(ErroResponse.deValidacao("Verifique os campos informados.", campos));
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponse> regraNegocio(RegraNegocioException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErroResponse.de(409, "Conflito", e.getMessage()));
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<ErroResponse> acessoNegado(AcessoNegadoException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErroResponse.de(403, "Acesso negado", e.getMessage()));
    }

    /**
     * Constraint do banco (e-mail ou CPF duplicado).
     *
     * A mensagem é deliberadamente vaga: dizer "este e-mail já está cadastrado"
     * transforma o cadastro num verificador de contas — dá para descobrir quem
     * usa a plataforma testando e-mails. O usuário legítimo que já tem conta
     * descobre isso ao tentar entrar, não ao tentar se cadastrar.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponse> integridade(DataIntegrityViolationException e) {
        log.warn("Violação de integridade no cadastro: {}", e.getMostSpecificCause().getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErroResponse.de(409, "Conflito",
                        "Não foi possível concluir o cadastro com os dados informados."));
    }

    /** Rede de segurança: nada além disto chega ao cliente. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> inesperado(Exception e) {
        log.error("Erro não tratado", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErroResponse.de(500, "Erro interno",
                        "Ocorreu um erro inesperado. Tente novamente."));
    }
}
