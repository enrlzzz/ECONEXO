package com.econexo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import com.econexo.repository.UsuarioRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lê o header "Authorization: Bearer <token>" e, se o token for válido,
 * marca a requisição como autenticada colocando o ID do usuário no contexto
 * do Spring Security.
 *
 * É esse id que os controllers usam para saber QUEM está chamando — nunca o
 * id que vem da URL. Sem isso, qualquer um editaria o cadastro alheio só
 * trocando o número no path.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String PREFIXO = "Bearer ";

    private final JwtService jwtService;
    private final FirebaseTokenService firebaseTokenService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthFilter(JwtService jwtService,
                         FirebaseTokenService firebaseTokenService,
                         UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.firebaseTokenService = firebaseTokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith(PREFIXO)) {
            String token = header.substring(PREFIXO.length()).trim();

            // Dois emissores aceitos: o ID token do Firebase (o front novo) e o
            // JWT próprio (mantido para não derrubar sessões antigas durante a
            // transição). Nos dois casos o principal é o id do NOSSO cadastro.
            // Token do Firebase de conta ainda sem cadastro aqui não autentica:
            // o front precisa chamar POST /api/auth/firebase primeiro.
            jwtService.idDoUsuario(token)
                    .or(() -> firebaseTokenService.verificar(token)
                            .flatMap(id -> usuarioRepository.findByFirebaseUid(id.uid()))
                            .map(u -> u.getIdUsuario()))
                    .ifPresent(idUsuario -> {
                var auth = new UsernamePasswordAuthenticationToken(
                        idUsuario, null, List.of());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            });
        }

        // Token ausente ou inválido não interrompe a cadeia aqui: a requisição
        // segue sem autenticação e é o SecurityConfig que decide se aquela
        // rota exigia login (401) ou era pública.
        filterChain.doFilter(request, response);
    }
}
