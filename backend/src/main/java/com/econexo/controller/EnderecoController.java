package com.econexo.controller;

import com.econexo.dto.EnderecoRequest;
import com.econexo.dto.EnderecoResponse;
import com.econexo.service.EnderecoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endereços — SEMPRE do usuário autenticado.
 *
 * Não existe rota para listar endereço de outra pessoa, e isso é proposital:
 * é endereço residencial de pessoa física. A rota antiga devolvia a base
 * inteira para qualquer usuário logado.
 */
@RestController
@RequestMapping("/api/enderecos")
public class EnderecoController {

    private final EnderecoService service;

    public EnderecoController(EnderecoService service) {
        this.service = service;
    }

    @GetMapping
    public List<EnderecoResponse> meusEnderecos(
            @AuthenticationPrincipal Integer idAutenticado) {
        return service.meusEnderecos(idAutenticado);
    }

    @PostMapping
    public ResponseEntity<EnderecoResponse> salvar(
            @AuthenticationPrincipal Integer idAutenticado,
            @Valid @RequestBody EnderecoRequest req) {

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
