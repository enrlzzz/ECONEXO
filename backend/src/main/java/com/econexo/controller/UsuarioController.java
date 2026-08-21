package com.econexo.controller;

import com.econexo.dto.ErroResponse;
import com.econexo.dto.UsuarioRequest;
import com.econexo.dto.UsuarioResponse;
import com.econexo.security.RateLimitService;
import com.econexo.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Todos os métodos respondem com UsuarioResponse — nunca com a entidade JPA.
 * É o que impede senha e CPF de saírem no JSON.
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final RateLimitService rateLimit;

    public UsuarioController(UsuarioService usuarioService, RateLimitService rateLimit) {
        this.usuarioService = usuarioService;
        this.rateLimit = rateLimit;
    }

    /** Cadastro — rota pública, por isso também limitada por tentativa. */
    @PostMapping
    public ResponseEntity<?> criarUsuario(@Valid @RequestBody UsuarioRequest req,
                                          HttpServletRequest request) {

        long bloqueio = rateLimit.segundosDeBloqueio(request, req.email());
        if (bloqueio > 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(bloqueio))
                    .body(ErroResponse.de(429, "Muitas tentativas",
                            "Excesso de tentativas. Tente novamente em "
                          + Math.ceil(bloqueio / 60.0) + " minuto(s)."));
        }

        // Só a FALHA conta. Contar toda tentativa bloquearia cadastros
        // legítimos em massa vindos do mesmo IP — o Wi-Fi da faculdade num dia
        // de apresentação, por exemplo. Enumeração de e-mail continua contida
        // porque a tentativa com e-mail já existente falha (409) e é contada.
        try {
            UsuarioResponse criado = usuarioService.criarUsuario(req);
            rateLimit.registrarSucesso(request, req.email());
            return ResponseEntity.status(HttpStatus.CREATED).body(criado);
        } catch (RuntimeException e) {
            rateLimit.registrarFalha(request, req.email());
            throw e;
        }
    }

    @GetMapping
    public List<UsuarioResponse> listarTodos() {
        return usuarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(@PathVariable Integer id) {
        return usuarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** O id do path só é aceito se bater com o do token (ver UsuarioService). */
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> atualizarUsuario(
            @PathVariable Integer id,
            @AuthenticationPrincipal Integer idAutenticado,
            @Valid @RequestBody UsuarioRequest req) {

        return ResponseEntity.ok(usuarioService.atualizarUsuario(id, idAutenticado, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(
            @PathVariable Integer id,
            @AuthenticationPrincipal Integer idAutenticado) {

        usuarioService.deletarUsuario(id, idAutenticado);
        return ResponseEntity.noContent().build();
    }
}
