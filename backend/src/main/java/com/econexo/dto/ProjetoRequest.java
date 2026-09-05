package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Sem campo `criador`: o dono do projeto é quem está autenticado.
 *
 * Antes o controller recebia a entidade Projeto direto, então bastava mandar
 * {"criador": {"idUsuario": 7}} para cadastrar um projeto no nome de outra
 * pessoa — mass assignment clássico.
 */
public record ProjetoRequest(

        @NotBlank(message = "Título é obrigatório")
        @Size(max = 150, message = "Título deve ter no máximo 150 caracteres")
        String titulo,

        String descricao,

        @Size(max = 50, message = "Tipo deve ter no máximo 50 caracteres")
        String tipoProjeto,

        @Size(max = 50, message = "Status deve ter no máximo 50 caracteres")
        String status,

        LocalDate dataInicio,
        LocalDate dataFim,

        @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
        String cidade,

        @Pattern(regexp = "^$|^[A-Za-z]{2}$", message = "Estado deve ser a sigla de 2 letras (ex: SP)")
        String estado,

        @DecimalMin(value = "0.0", inclusive = false, message = "Potência deve ser maior que zero")
        BigDecimal potenciaKwp
) {
}
