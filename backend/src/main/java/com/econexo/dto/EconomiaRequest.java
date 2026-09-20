package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Texto das contas de energia a analisar.
 *
 * Passou de uma conta só para uma lista com no mínimo duas: com um mês
 * isolado não há como separar o que é consumo do que é bandeira tarifária,
 * imposto ou reajuste — a IA só consegue apontar a causa de um aumento
 * comparando meses.
 *
 * Chega TEXTO, não arquivo: o PDF é lido no navegador. Conta de luz traz
 * nome, CPF e endereço do titular, e o arquivo nunca trafegar nem ser
 * gravado evita ter de tratá-lo como dado pessoal em repouso.
 */
public record EconomiaRequest(

        @NotNull(message = "Envie o texto das contas")
        @Size(min = 2, max = 6, message = "Envie de 2 a 6 contas para comparar")
        List<@NotBlank(message = "Conta vazia") String> contas
) {
}
