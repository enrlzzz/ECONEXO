package com.econexo.security;

import com.econexo.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/**
 * Emite e valida os tokens JWT.
 *
 * O token carrega apenas id, nome e e-mail. Nada sensível: qualquer pessoa
 * com o token consegue ler o conteúdo (JWT é assinado, não criptografado).
 * A assinatura garante que ninguém ALTERE o conteúdo — é isso que permite
 * confiar no id que vem dele em vez de no id que vem da URL.
 */
@Service
public class JwtService {

    private final SecretKey chave;
    private final Duration validade;

    public JwtService(
            @Value("${econexo.jwt.secret}") String secret,
            @Value("${econexo.jwt.validade-horas:8}") long validadeHoras) {

        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);

        // HS256 exige 256 bits. Uma chave curta seria aceita pela lib mas
        // quebrável por força bruta — e um token forjável derruba toda a
        // autenticação de uma vez. Melhor não subir do que subir fraco.
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "econexo.jwt.secret precisa ter no mínimo 32 caracteres (tem " + bytes.length + "). "
                  + "Em produção, defina a variável de ambiente JWT_SECRET com um valor aleatório longo.");
        }

        this.chave = Keys.hmacShaKeyFor(bytes);
        this.validade = Duration.ofHours(validadeHoras);
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(usuario.getIdUsuario()))
                .claim("nome", usuario.getNome())
                .claim("email", usuario.getEmail())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(validade)))
                .signWith(chave)
                .compact();
    }

    public long validadeEmSegundos() {
        return validade.toSeconds();
    }

    /**
     * Devolve o id do usuário se o token for válido e não estiver expirado.
     * Optional.empty() para qualquer problema — assinatura inválida, expirado,
     * malformado. Quem chama não precisa distinguir: em todos os casos a
     * resposta ao cliente é a mesma (401), justamente para não dar pistas.
     */
    public Optional<Integer> idDoUsuario(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(chave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return Optional.of(Integer.valueOf(claims.getSubject()));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
