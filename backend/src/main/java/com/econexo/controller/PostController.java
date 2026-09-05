package com.econexo.controller;

import com.econexo.dto.ComentarioRequest;
import com.econexo.dto.ComentarioResponse;
import com.econexo.dto.PostRequest;
import com.econexo.dto.PostResponse;
import com.econexo.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Timeline. Tudo aqui exige token (está sob /api/**, fora das duas exceções
 * do SecurityConfig).
 *
 * Note que nenhum método recebe o id do autor: ele vem sempre de
 * @AuthenticationPrincipal, ou seja, do token assinado.
 */
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<PostResponse> listar(@AuthenticationPrincipal Integer idAutenticado) {
        return postService.listar(idAutenticado);
    }

    @PostMapping
    public ResponseEntity<PostResponse> criar(@AuthenticationPrincipal Integer idAutenticado,
                                              @Valid @RequestBody PostRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.criar(idAutenticado, req));
    }

    @PostMapping("/{id}/curtida")
    public PostResponse alternarCurtida(@PathVariable Integer id,
                                        @AuthenticationPrincipal Integer idAutenticado) {
        return postService.alternarCurtida(id, idAutenticado);
    }

    @PostMapping("/{id}/comentarios")
    public ResponseEntity<ComentarioResponse> comentar(
            @PathVariable Integer id,
            @AuthenticationPrincipal Integer idAutenticado,
            @Valid @RequestBody ComentarioRequest req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.comentar(id, idAutenticado, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id,
                                        @AuthenticationPrincipal Integer idAutenticado) {
        postService.excluir(id, idAutenticado);
        return ResponseEntity.noContent().build();
    }
}
