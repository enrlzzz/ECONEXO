package com.econexo.controller;

import com.econexo.dto.FormacaoRequest;
import com.econexo.dto.FormacaoResponse;
import com.econexo.service.FormacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formacoes")
public class FormacaoController {

    private final FormacaoService service;

    public FormacaoController(FormacaoService service) {
        this.service = service;
    }

    /** Sem id, devolve as suas. Com id, o currículo público de alguém. */
    @GetMapping
    public List<FormacaoResponse> listar(
            @RequestParam(required = false) Integer usuarioId,
            @AuthenticationPrincipal Integer idAutenticado) {

        return service.doUsuario(usuarioId != null ? usuarioId : idAutenticado);
    }

    @PostMapping
    public ResponseEntity<FormacaoResponse> salvar(
            @AuthenticationPrincipal Integer idAutenticado,
            @Valid @RequestBody FormacaoRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.salvar(idAutenticado, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id,
                                        @AuthenticationPrincipal Integer idAutenticado) {
        service.excluir(id, idAutenticado);
        return ResponseEntity.noContent().build();
    }
}
