package com.econexo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Sem campo `avaliador`: quem avalia é o dono do token.
 *
 * Antes o controller recebia a entidade Avaliacao, então era possível mandar
 * {"avaliador":{"idUsuario":9}} e fabricar uma nota positiva assinada por
 * outra pessoa — num sistema cujo produto é reputação, isso é o pior caso.
 */
public record AvaliacaoRequest(

        @NotNull(message = "Informe quem está sendo avaliado")
        Integer avaliadoId,

        Integer projetoId,

        @NotNull(message = "Nota é obrigatória")
        @Min(value = 1, message = "Nota mínima é 1")
        @Max(value = 5, message = "Nota máxima é 5")
        Integer estrelas,

        @Size(max = 2000, message = "Comentário deve ter no máximo 2000 caracteres")
        String comentario
) {
}
