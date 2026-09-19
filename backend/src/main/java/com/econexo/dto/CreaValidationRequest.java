package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;

public record CreaValidationRequest(@NotBlank String nome, @NotBlank String registro, @NotBlank String uf) {}
