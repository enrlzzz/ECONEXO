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

        /**
         * Obrigatória no CADASTRO — a presença é validada em UsuarioService,
         * não por @NotBlank, porque este mesmo record é reusado na EDIÇÃO de
         * perfil. Com @NotBlank aqui, salvar nome ou cidade exigia reenviar a
         * senha, e o PUT respondia 400 para quem só queria trocar a cidade.
         *
         * @Size continua valendo: senha presente e curta é rejeitada; ausente
         * (null) passa pela validação e é ignorada na atualização.
         *
         * 72 é o limite do BCrypt: bytes além disso são silenciosamente
         * ignorados. Barrar aqui evita que "senha de 100 chars" dê uma falsa
         * sensação de força.
         */
        @Size(min = 8, max = 72, message = "Senha deve ter entre 8 e 72 caracteres")
        String senha,

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

        /**
         * INSTALADOR, PROJETISTA, TECNICO ou vazio. Validado por regex e não
         * por enum para que a lista possa crescer sem quebrar cadastros antigos.
         */
        @Pattern(regexp = "^$|^(INSTALADOR|PROJETISTA|TECNICO)$",
                message = "Tipo profissional inválido")
        String tipoProfissional,

        /**
         * Aceite da Política de Privacidade. Obrigatório no CADASTRO —
         * validado em UsuarioService, não por anotação, porque a atualização
         * de perfil reusa este record e não precisa reafirmar o aceite.
         */
        Boolean consentimentoLgpd
) {
}
