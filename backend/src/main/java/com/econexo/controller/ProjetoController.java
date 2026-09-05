package com.econexo.controller;

import com.econexo.dto.ProjetoRequest;
import com.econexo.dto.ProjetoResponse;
import com.econexo.service.ProjetoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projetos")
public class ProjetoController {

    private final ProjetoService service;

    public ProjetoController(ProjetoService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProjetoResponse> listarTodos() {
        return service.listarTodos();
    }

    @PostMapping
    public ResponseEntity<ProjetoResponse> criar(
            @AuthenticationPrincipal Integer idAutenticado,
            @Valid @RequestBody ProjetoRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.criar(idAutenticado, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id,
                                        @AuthenticationPrincipal Integer idAutenticado) {
        service.deletar(id, idAutenticado);
        return ResponseEntity.noContent().build();
    }
}
