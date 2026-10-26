package com.econexo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health checks públicos, usados pelo keep-alive do GitHub Actions
 * (.github/workflows/keep-alive.yml) e para medir a lentidão do login.
 *
 * Ficam FORA de /api/** de propósito: a regra 4 do CLAUDE.md diz que todo
 * endpoint sob /api/** exige autenticação, exceto login e cadastro. Um
 * /api/health público abriria uma exceção na regra; /health não mexe nela.
 *
 * Nenhum dos dois lê dado de usuário nem devolve algo sensível.
 */
@RestController
public class HealthController {

    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Só confirma que o Spring está de pé. NÃO toca no banco — é o que o
     * healthCheckPath do Render precisa, e um banco fora do ar não deve
     * fazer o Render reiniciar a aplicação em loop.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    /**
     * Health check COM banco: faz um SELECT 1 e devolve quanto levou.
     *
     * Serve a dois propósitos:
     *  - o keep-alive passa a usá-lo, mantendo as conexões do pool vivas
     *    (o /health simples deixava a API acordada mas o pool dormindo, e o
     *    primeiro login depois de um tempo pagava a reconexão TLS com o
     *    MySQL da Hostinger);
     *  - "bancoMs" mostra a latência Render -> Hostinger. Se esse número é
     *    alto (centenas de ms), cada consulta do app custa isso — e uma tela
     *    que faz 20 consultas fica lenta.
     */
    @GetMapping("/health/db")
    public ResponseEntity<Map<String, Object>> healthDb() {
        long inicio = System.nanoTime();
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            long ms = (System.nanoTime() - inicio) / 1_000_000;
            return ResponseEntity.ok(Map.of("status", "ok", "banco", "ok", "bancoMs", ms));
        } catch (Exception e) {
            // Sem detalhe da exceção: mensagem de driver pode citar host e usuário.
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("status", "erro", "banco", "indisponivel"));
        }
    }
}
