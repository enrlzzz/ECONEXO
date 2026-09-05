package com.econexo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check público, usado pelo keep-alive do GitHub Actions
 * (.github/workflows/keep-alive.yml).
 *
 * Fica FORA de /api/** de propósito: a regra 4 do CLAUDE.md diz que todo
 * endpoint sob /api/** exige autenticação, exceto login e cadastro. Um
 * /api/health público abriria uma exceção na regra; /health não mexe nela.
 *
 * Não toca no banco e não lê nada de sensível: responde 200 assim que o
 * contexto do Spring está de pé, que é exatamente o que o ping precisa saber.
 * Se o banco estiver fora, o boot já falha antes deste endpoint existir.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
