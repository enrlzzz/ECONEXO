package com.econexo.controller;

import com.econexo.dto.NotificacaoResponse;
import com.econexo.service.NotificacaoService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** Todas as rotas respondem só sobre o dono do token — o id nunca vem da URL. */
@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    private final NotificacaoService service;

    public NotificacaoController(NotificacaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<NotificacaoResponse> listar(@AuthenticationPrincipal Integer idAutenticado) {
        return service.listar(idAutenticado);
    }

    /** Contador do sino. Leve de propósito: o cabeçalho consulta de tempos em tempos. */
    @GetMapping("/nao-lidas")
    public Map<String, Long> naoLidas(@AuthenticationPrincipal Integer idAutenticado) {
        return Map.of("total", service.contarNaoLidas(idAutenticado));
    }

    @PostMapping("/lidas")
    public void lidas(@AuthenticationPrincipal Integer idAutenticado) {
        service.marcarLidas(idAutenticado);
    }

    @PostMapping("/{id}/lida")
    public void lida(@PathVariable Integer id, @AuthenticationPrincipal Integer idAutenticado) {
        service.marcarLida(idAutenticado, id);
    }
}
