package com.econexo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Origens autorizadas a chamar a API.
 *
 * O Spring Security consome este bean (ver SecurityConfig).
 */
@Configuration
public class WebConfig {

    private final String allowedOrigins;
    private final Environment environment;

    public WebConfig(@Value("${econexo.cors.allowed-origins:}") String allowedOrigins,
                     Environment environment) {
        this.allowedOrigins = allowedOrigins;
        this.environment = environment;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        boolean producao = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        List<String> origens = (allowedOrigins == null || allowedOrigins.isBlank())
                ? List.of()
                : Arrays.stream(allowedOrigins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();

        // Antes, config vazia caía num "*" silencioso. Combinado com
        // allowCredentials, isso autoriza QUALQUER site a chamar a API com as
        // credenciais do usuário logado. Em produção, é melhor não subir do
        // que subir liberado para o mundo — o erro aparece no deploy, não numa
        // auditoria seis meses depois.
        if (producao && origens.isEmpty()) {
            throw new IllegalStateException(
                    "APP_ALLOWED_ORIGINS não definida. Em produção o CORS precisa listar "
                  + "explicitamente os domínios autorizados (ex.: https://econexo.com).");
        }

        CorsConfiguration config = new CorsConfiguration();

        if (origens.isEmpty()) {
            // Só dev: as portas do Vite.
            config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:4173"));
        } else {
            config.setAllowedOrigins(origens);
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));

        // O token vai no header Authorization, não em cookie: não há credencial
        // que o navegador anexe sozinho, então allowCredentials é desnecessário
        // — e desligá-lo impede o combo perigoso "credenciais + curinga".
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
