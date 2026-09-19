package com.econexo.controller;

import com.econexo.dto.CreaValidationRequest;
import com.econexo.dto.CreaValidationResponse;
import com.econexo.service.ValidacaoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/validacoes")
public class ValidacaoController {
    private final ValidacaoService service;
    public ValidacaoController(ValidacaoService service) { this.service = service; }

    @PostMapping("/crea")
    public CreaValidationResponse crea(@Valid @RequestBody CreaValidationRequest request) {
        return service.consultarCrea(request);
    }
}
