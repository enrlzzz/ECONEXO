package com.econexo.controller;

import com.econexo.dto.AvaliacaoRequest;
import com.econexo.dto.AvaliacaoResponse;
import com.econexo.service.AvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService service;

    public AvaliacaoController(AvaliacaoService service) {
        this.service = service;
    }

    /** Avaliações recebidas por um profissional. Sem id, as suas. */
    @GetMapping
    public List<AvaliacaoResponse> listar(
            @RequestParam(required = false) Integer usuarioId,
            @AuthenticationPrincipal Integer idAutenticado) {

        return service.doUsuario(usuarioId != null ? usuarioId : idAutenticado);
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponse> avaliar(
            @AuthenticationPrincipal Integer idAutenticado,
            @Valid @RequestBody AvaliacaoRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.avaliar(idAutenticado, req));
    }
}
