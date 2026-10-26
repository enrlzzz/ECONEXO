package com.econexo.controller;

import com.econexo.dto.PontoRecargaResponse;
import com.econexo.service.PontosRecargaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Pontos de recarga para veículos elétricos.
 *
 * Exige token (via SecurityConfig: todo /api/** é autenticado).
 * Proxy para a OpenChargeMap API — mantém a chave OCM no servidor.
 */
@RestController
@RequestMapping("/api/pontos-recarga")
public class PontosRecargaController {

    private final PontosRecargaService service;

    public PontosRecargaController(PontosRecargaService service) {
        this.service = service;
    }

    /**
     * Busca pontos próximos às coordenadas informadas.
     *
     * @param lat   latitude do centro da busca (default: Sorocaba, SP)
     * @param lng   longitude do centro da busca (default: Sorocaba, SP)
     * @param raio  raio em quilômetros (1–100, default: 30)
     */
    @GetMapping
    public ResponseEntity<List<PontoRecargaResponse>> buscar(
            Authentication auth,
            @RequestParam(defaultValue = "-23.5015") double lat,
            @RequestParam(defaultValue = "-47.4526") double lng,
            @RequestParam(defaultValue = "30") int raio) {

        int raioSeguro = Math.max(1, Math.min(raio, 100));
        return ResponseEntity.ok(service.buscar(lat, lng, raioSeguro));
    }
}
