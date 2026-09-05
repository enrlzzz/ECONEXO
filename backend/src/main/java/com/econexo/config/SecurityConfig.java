package com.econexo.config;

import com.econexo.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    /**
     * BCrypt com fator 12 (o padrão do Spring é 10).
     *
     * Cada +1 dobra o tempo de cálculo: encarece o brute force offline caso o
     * banco vaze, sem impacto perceptível no login (~250ms).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // CSRF protege sessão por cookie. Aqui a credencial é um token no
            // header Authorization, que o navegador não envia sozinho em
            // requisição cross-site — logo não há o que sequestrar.
            .csrf(csrf -> csrf.disable())

            // Sem sessão no servidor: cada requisição se identifica pelo token.
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                    // Preflight do CORS precisa passar sem token.
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // Health check do keep-alive (GitHub Actions). Não expõe
                    // nada: responde {"status":"ok"} sem tocar no banco.
                    .requestMatchers(HttpMethod.GET, "/health").permitAll()

                    // As duas únicas portas abertas: entrar e criar conta.
                    .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()

                    // Todo o resto exige token válido.
                    .anyRequest().authenticated()
            )

            // Sem token válido a resposta é 401 em JSON. O padrão do Spring
            // Security seria redirecionar para uma página de login, o que num
            // SPA vira HTML chegando onde o fetch esperava JSON.
            .exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> {
                res.setStatus(401);
                res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                res.setCharacterEncoding("UTF-8");
                res.getWriter().write(
                        "{\"status\":401,\"erro\":\"Não autenticado\","
                      + "\"mensagem\":\"Faça login para acessar este recurso.\"}");
            }))

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
