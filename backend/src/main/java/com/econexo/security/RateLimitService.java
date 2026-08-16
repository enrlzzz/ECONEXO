package com.econexo.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Limita tentativas de login e de cadastro: 10 tentativas, bloqueio de 15 min.
 *
 * A chave é IP + e-mail, e as duas contam separadamente, de propósito:
 *
 *  - só por IP  → um ataque distribuído (uma tentativa por IP) passa batido;
 *  - só por e-mail → um atacante tranca a conta de outra pessoa de propósito
 *    errando a senha dela 10 vezes (negação de serviço contra a vítima).
 *
 * Contando as duas, o ataque distribuído esbarra no contador de e-mail e o
 * ataque de bloqueio esbarra no de IP.
 *
 * LIMITAÇÃO CONHECIDA: o estado vive em memória. Reiniciar o backend zera os
 * contadores, e com mais de uma instância cada uma conta a sua. Para o
 * free tier do Render (instância única) está correto; se um dia escalar,
 * isto precisa ir para Redis.
 */
@Service
public class RateLimitService {

    private final int maxPorEmail;
    private final int maxPorIp;
    private final Duration bloqueio;

    private final Map<String, Registro> registros = new ConcurrentHashMap<>();

    public RateLimitService(
            @Value("${econexo.rate-limit.max-tentativas:10}") int maxTentativas,
            @Value("${econexo.rate-limit.multiplicador-ip:3}") int multiplicadorIp,
            @Value("${econexo.rate-limit.bloqueio-minutos:15}") long bloqueioMinutos) {

        this.maxPorEmail = maxTentativas;

        // O limite por IP é deliberadamente mais folgado que o por e-mail.
        // Numa rede com NAT — o Wi-Fi da faculdade, por exemplo — dezenas de
        // pessoas legítimas compartilham o mesmo IP: com o mesmo limite dos
        // dois lados, alguns erros de senha de colegas diferentes bloqueariam
        // a turma inteira. Quem protege a CONTA é o contador por e-mail (10);
        // o de IP existe para conter varredura em massa.
        this.maxPorIp = maxTentativas * Math.max(multiplicadorIp, 1);

        this.bloqueio = Duration.ofMinutes(bloqueioMinutos);
    }

    private static final class Registro {
        final AtomicInteger tentativas = new AtomicInteger();
        volatile Instant bloqueadoAte;
        volatile Instant ultimoAcesso = Instant.now();
    }

    /** Quantos segundos ainda faltam para liberar, ou 0 se não está bloqueado. */
    public long segundosDeBloqueio(HttpServletRequest request, String email) {
        limparAntigos();
        long ip = restante(chaveIp(request));
        long mail = restante("email:" + normalizar(email));
        return Math.max(ip, mail);
    }

    /** Registra uma tentativa que falhou. Só falhas contam. */
    public void registrarFalha(HttpServletRequest request, String email) {
        incrementar(chaveIp(request), maxPorIp);
        incrementar("email:" + normalizar(email), maxPorEmail);
    }

    /** Apenas para testes: zera todo o estado entre cenários. */
    public void limparTudo() {
        registros.clear();
    }

    /** Login/cadastro deu certo: zera os contadores daquele IP e e-mail. */
    public void registrarSucesso(HttpServletRequest request, String email) {
        registros.remove(chaveIp(request));
        registros.remove("email:" + normalizar(email));
    }

    private void incrementar(String chave, int limite) {
        Registro r = registros.computeIfAbsent(chave, k -> new Registro());
        r.ultimoAcesso = Instant.now();
        if (r.tentativas.incrementAndGet() >= limite) {
            r.bloqueadoAte = Instant.now().plus(bloqueio);
            r.tentativas.set(0);
        }
    }

    private long restante(String chave) {
        Registro r = registros.get(chave);
        if (r == null || r.bloqueadoAte == null) return 0;
        long s = Duration.between(Instant.now(), r.bloqueadoAte).toSeconds();
        return Math.max(s, 0);
    }

    private String chaveIp(HttpServletRequest request) {
        return "ip:" + ipDoCliente(request);
    }

    /**
     * Atrás do proxy do Render o remoteAddr é sempre o do proxy, igual para
     * todo mundo — o IP real vem no X-Forwarded-For. Pegamos o PRIMEIRO da
     * lista, que é o cliente original; os seguintes são os proxies.
     */
    private String ipDoCliente(HttpServletRequest request) {
        String encaminhado = request.getHeader("X-Forwarded-For");
        if (encaminhado != null && !encaminhado.isBlank()) {
            return encaminhado.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String normalizar(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    /** Evita que o mapa cresça para sempre com IPs que nunca mais voltaram. */
    private void limparAntigos() {
        Instant corte = Instant.now().minus(bloqueio).minus(Duration.ofMinutes(5));
        registros.entrySet().removeIf(e -> {
            Registro r = e.getValue();
            boolean bloqueioVencido = r.bloqueadoAte == null || r.bloqueadoAte.isBefore(Instant.now());
            return bloqueioVencido && r.ultimoAcesso.isBefore(corte);
        });
    }
}
