package com.econexo.controller;

import com.econexo.dto.EconomiaRequest;
import com.econexo.dto.ErroResponse;
import com.econexo.service.EconomiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/economia")
public class EconomiaController {

    private final EconomiaService service;

    public EconomiaController(EconomiaService service) {
        this.service = service;
    }

    @PostMapping("/analisar")
    public ResponseEntity<?> analisar(@AuthenticationPrincipal Integer idAutenticado,
                                      @Valid @RequestBody EconomiaRequest request) {

        // Cada análise consome a cota da IA da plataforma: limite por usuário.
        if (!service.permitir(idAutenticado)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ErroResponse.de(429, "Muitas análises",
                            "Você atingiu o limite de análises por hora. Tente de novo mais tarde."));
        }

        return ResponseEntity.ok(service.analisar(request));
    }
}
