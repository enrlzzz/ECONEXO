package com.econexo.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Valida o ID token emitido pelo Firebase Authentication.
 *
 * O token é um JWT RS256 assinado pelo Google. Conferimos, como manda a
 * documentação do Firebase ("Verify ID tokens using a third-party JWT
 * library"): assinatura contra as chaves públicas do Google, validade (exp e
 * iat), emissor https://securetoken.google.com/&lt;projeto&gt;, audiência igual
 * ao ID do projeto e "sub" (o UID) não vazio.
 *
 * Sem FIREBASE_PROJECT_ID configurado o serviço fica desligado e recusa
 * qualquer token — falhar fechado é melhor que aceitar token de qualquer
 * projeto Firebase do mundo.
 */
@Service
public class FirebaseTokenService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseTokenService.class);

    private static final String CHAVES_GOOGLE =
            "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

    private final JwtDecoder decoder;

    public FirebaseTokenService(@Value("${econexo.firebase.project-id:}") String projectId) {
        if (projectId == null || projectId.isBlank()) {
            log.warn("FIREBASE_PROJECT_ID ausente: login pelo Firebase desativado.");
            this.decoder = null;
            return;
        }

        NimbusJwtDecoder nimbus = NimbusJwtDecoder.withJwkSetUri(CHAVES_GOOGLE).build();

        OAuth2TokenValidator<Jwt> audiencia = jwt -> jwt.getAudience() != null
                && jwt.getAudience().contains(projectId)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "aud inválido", null));

        OAuth2TokenValidator<Jwt> sujeito = jwt -> jwt.getSubject() != null && !jwt.getSubject().isBlank()
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "sub vazio", null));

        nimbus.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer("https://securetoken.google.com/" + projectId),
                audiencia,
                sujeito));

        this.decoder = nimbus;
    }

    /** Identidade do token, ou vazio se ele não for um ID token válido deste projeto. */
    public Optional<IdentidadeFirebase> verificar(String token) {
        if (decoder == null || token == null || token.isBlank()) {
            return Optional.empty();
        }
        try {
            Jwt jwt = decoder.decode(token);
            return Optional.of(new IdentidadeFirebase(
                    jwt.getSubject(),
                    jwt.getClaimAsString("email"),
                    Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified")),
                    jwt.getClaimAsString("name")));
        } catch (JwtException e) {
            // Sem o token no log: ele é uma credencial válida por até 1 hora.
            log.debug("ID token do Firebase recusado: {}", e.getClass().getSimpleName());
            return Optional.empty();
        }
    }
}
