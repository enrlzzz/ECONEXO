package com.econexo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Dados que o cliente PODE enviar ao criar ou atualizar um usuário.
 *
 * Existe para fechar mass assignment: antes o controller recebia a entidade
 * Usuario direto, então bastava mandar {"idUsuario": 1} no corpo para
 * sobrescrever o registro de outra pessoa. Aqui não há campo de id — quem
 * decide o id é o banco (no cadastro) ou o token (na atualização).
 */
public record UsuarioRequest(

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, max = 72, message = "Senha deve ter entre 8 e 72 caracteres")
        String senha,

        // 72 é o limite do BCrypt: bytes além disso são silenciosamente ignorados.
        // Barrar aqui evita que "senha de 100 chars" dê uma falsa sensação de força.

        @Pattern(regexp = "^$|^\\d{11}$|^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$",
                message = "CPF deve ter 11 dígitos")
        String cpf,

        @Pattern(regexp = "^$|^\\+?[0-9 ()-]{8,20}$", message = "Telefone inválido")
        String telefone,

        @Past(message = "Data de nascimento deve ser no passado")
        LocalDate dataNascimento
) {
}
