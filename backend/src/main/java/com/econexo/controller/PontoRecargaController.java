package com.econexo.controller;

import com.econexo.dto.PontosRecargaResponse;
import com.econexo.service.PontoRecargaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recarga")
public class PontoRecargaController {

    private final PontoRecargaService service;

    public PontoRecargaController(PontoRecargaService service) {
        this.service = service;
    }

    /** Autenticado como todo /api/** — o SecurityConfig não abre exceção para cá. */
    @GetMapping("/pontos")
    public PontosRecargaResponse pontos() {
        return service.listar();
    }
}
