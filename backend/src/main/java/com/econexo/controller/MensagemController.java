package com.econexo.controller;

import com.econexo.dto.ConversaResponse;
import com.econexo.dto.MensagemRequest;
import com.econexo.dto.MensagemResponse;
import com.econexo.service.MensagemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Mensagens diretas. O usuário só enxerga o que enviou ou recebeu — o id do
 * token é usado como filtro em todas as consultas, não como parâmetro opcional.
 */
@RestController
@RequestMapping("/api/mensagens")
public class MensagemController {

    private final MensagemService mensagemService;

    public MensagemController(MensagemService mensagemService) {
        this.mensagemService = mensagemService;
    }

    /** Caixa de entrada agrupada por interlocutor. */
    @GetMapping
    public List<ConversaResponse> conversas(@AuthenticationPrincipal Integer idAutenticado) {
        return mensagemService.conversasDe(idAutenticado);
    }

    @GetMapping("/{idOutro}")
    public List<MensagemResponse> conversaCom(@PathVariable Integer idOutro,
                                              @AuthenticationPrincipal Integer idAutenticado) {
        return mensagemService.conversaCom(idAutenticado, idOutro);
    }

    @PostMapping
    public ResponseEntity<MensagemResponse> enviar(
            @AuthenticationPrincipal Integer idAutenticado,
            @Valid @RequestBody MensagemRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mensagemService.enviar(idAutenticado, req));
    }

    @PostMapping("/{idOutro}/lida")
    public ResponseEntity<Void> marcarComoLida(@PathVariable Integer idOutro,
                                               @AuthenticationPrincipal Integer idAutenticado) {
        mensagemService.marcarComoLida(idAutenticado, idOutro);
        return ResponseEntity.noContent().build();
    }
}
