package com.econexo.controller;

import com.econexo.dto.CreaDecisaoRequest;
import com.econexo.dto.CreaPendenteResponse;
import com.econexo.dto.CreaValidationRequest;
import com.econexo.dto.CreaValidationResponse;
import com.econexo.service.ValidacaoService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Credencial CREA. O dono de tudo aqui é o token: o profissional só mexe na
 * própria credencial, e a fila e a decisão exigem administrador (conferido no
 * service, pelo banco — não pelo que o front-end diz).
 */
@RestController
@RequestMapping("/api/validacoes")
public class ValidacaoController {

    private final ValidacaoService service;

    public ValidacaoController(ValidacaoService service) {
        this.service = service;
    }

    /** Pede a verificação do próprio registro. */
    @PostMapping("/crea")
    public CreaValidationResponse solicitar(@AuthenticationPrincipal Integer idAutenticado,
                                            @Valid @RequestBody CreaValidationRequest request) {
        return service.solicitar(idAutenticado, request);
    }

    /** Situação da minha credencial. */
    @GetMapping("/crea/minha")
    public CreaValidationResponse minha(@AuthenticationPrincipal Integer idAutenticado) {
        return service.minha(idAutenticado);
    }

    /** Fila de conferência (administrador). */
    @GetMapping("/crea/pendentes")
    public List<CreaPendenteResponse> pendentes(@AuthenticationPrincipal Integer idAutenticado) {
        return service.pendentes(idAutenticado);
    }

    /** Aprova ou rejeita (administrador). */
    @PostMapping("/crea/{id}/decisao")
    public CreaValidationResponse decidir(@PathVariable Integer id,
                                          @AuthenticationPrincipal Integer idAutenticado,
                                          @Valid @RequestBody CreaDecisaoRequest request) {
        return service.decidir(idAutenticado, id, request.aprovada(), request.observacao());
    }
}
