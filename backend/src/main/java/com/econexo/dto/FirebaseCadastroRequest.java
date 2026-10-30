package com.econexo.dto;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Dados do cadastro que o Firebase não guarda.
 *
 * E-mail e senha ficam no Firebase; o e-mail que vale aqui é o do ID token,
 * nunca um enviado no corpo — senão bastaria mandar o e-mail de outra pessoa
 * para se vincular à conta dela. Por isso este record não tem campo de e-mail
 * nem de senha.
 *
 * Tudo é opcional porque a mesma chamada serve para quem já tem cadastro
 * (corpo vazio). Para criar um cadastro novo, nome e consentimento LGPD são
 * exigidos em UsuarioService.
 */
public record FirebaseCadastroRequest(

        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @Pattern(regexp = "^$|^\\d{11}$|^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$",
                message = "CPF deve ter 11 dígitos")
        String cpf,

        @Pattern(regexp = "^$|^\\+?[0-9 ()-]{8,20}$", message = "Telefone inválido")
        String telefone,

        @Past(message = "Data de nascimento deve ser no passado")
        LocalDate dataNascimento,

        @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
        String cidade,

        @Pattern(regexp = "^$|^[A-Za-z]{2}$", message = "Estado deve ser a sigla de 2 letras (ex: SP)")
        String estado,

        @Pattern(regexp = "^$|^(INSTALADOR|PROJETISTA|TECNICO)$",
                message = "Tipo profissional inválido")
        String tipoProfissional,

        Boolean consentimentoLgpd
) {
}
