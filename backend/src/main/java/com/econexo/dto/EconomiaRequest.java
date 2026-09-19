package com.econexo.dto;

import jakarta.validation.constraints.NotBlank;

public record EconomiaRequest(@NotBlank String conta) {}
