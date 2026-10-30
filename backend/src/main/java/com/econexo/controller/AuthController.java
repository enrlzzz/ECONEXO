package com.econexo.controller;

import com.econexo.dto.ErroResponse;
import com.econexo.dto.FirebaseCadastroRequest;
import com.econexo.dto.LoginRequest;
import com.econexo.dto.LoginResponse;
import com.econexo.dto.UsuarioResponse;
import com.econexo.model.Usuario;
import com.econexo.security.FirebaseTokenService;
import com.econexo.security.IdentidadeFirebase;
import com.econexo.security.JwtService;
import com.econexo.security.RateLimitService;
import com.econexo.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;
    private final RateLimitService rateLimit;
    private final FirebaseTokenService firebaseTokenService;

    public AuthController(UsuarioService usuarioService,
                          JwtService jwtService,
                          RateLimitService rateLimit,
                          FirebaseTokenService firebaseTokenService) {
        this.firebaseTokenService = firebaseTokenService;
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
        this.rateLimit = rateLimit;
    }

    /**
     * POST /api/auth/login — credenciais no CORPO, nunca na URL.
     *
     * Devolve sempre a mesma resposta para "e-mail não existe" e "senha
     * errada": qualquer diferença entre os dois vira um jeito de descobrir
     * quem tem conta na plataforma.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req,
                                   HttpServletRequest request) {

        long bloqueio = rateLimit.segundosDeBloqueio(request, req.email());
        if (bloqueio > 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(bloqueio))
                    .body(ErroResponse.de(429, "Muitas tentativas",
                            "Excesso de tentativas. Tente novamente em "
                          + Math.ceil(bloqueio / 60.0) + " minuto(s)."));
        }

        Optional<Usuario> autenticado = usuarioService.validarLogin(req.email(), req.senha());

        if (autenticado.isEmpty()) {
            rateLimit.registrarFalha(request, req.email());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErroResponse.de(401, "Credenciais inválidas",
                            "E-mail ou senha incorretos."));
        }

        rateLimit.registrarSucesso(request, req.email());

        Usuario usuario = autenticado.get();
        return ResponseEntity.ok(new LoginResponse(
                jwtService.gerarToken(usuario),
                jwtService.validadeEmSegundos(),
                UsuarioResponse.de(usuario)
        ));
    }

    /**
     * POST /api/auth/firebase — liga a conta do Firebase ao cadastro daqui.
     *
     * Pública na SecurityConfig porque quem ainda não tem cadastro não passa
     * no filtro de autenticação. A identidade sai do ID token no header
     * Authorization, validado aqui mesmo; e-mail e UID nunca vêm do corpo.
     */
    @PostMapping("/firebase")
    public ResponseEntity<?> firebase(@RequestHeader(value = "Authorization", required = false) String autorizacao,
                                      @Valid @RequestBody(required = false) FirebaseCadastroRequest req,
                                      HttpServletRequest request) {

        long bloqueio = rateLimit.segundosDeBloqueio(request, "firebase");
        if (bloqueio > 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(bloqueio))
                    .body(ErroResponse.de(429, "Muitas tentativas",
                            "Excesso de tentativas. Tente novamente em "
                          + Math.ceil(bloqueio / 60.0) + " minuto(s)."));
        }

        String token = autorizacao != null && autorizacao.startsWith("Bearer ")
                ? autorizacao.substring(7).trim() : null;
        Optional<IdentidadeFirebase> identidade = firebaseTokenService.verificar(token);

        if (identidade.isEmpty()) {
            rateLimit.registrarFalha(request, "firebase");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ErroResponse.de(401, "Não autenticado",
                            "Sua sessão expirou. Entre de novo."));
        }

        return ResponseEntity.ok(usuarioService.entrarComFirebase(identidade.get(), req));
    }
}
