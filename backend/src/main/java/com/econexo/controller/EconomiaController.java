package com.econexo.controller;

import com.econexo.dto.AnaliseResumoResponse;
import com.econexo.dto.EconomiaRequest;
import com.econexo.dto.EconomiaResponse;
import com.econexo.dto.ErroResponse;
import com.econexo.service.AnaliseContaService;
import com.econexo.service.EconomiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/economia")
public class EconomiaController {

    private final EconomiaService service;
    private final AnaliseContaService historico;

    public EconomiaController(EconomiaService service, AnaliseContaService historico) {
        this.service = service;
        this.historico = historico;
    }

    /**
     * Pública: visitante analisa sem conta e nada é salvo. Com login, a
     * análise entra no histórico do dono do token e volta com idAnalise.
     *
     * Sem limite de uso por decisão do dono do produto (out/2026). Cada
     * chamada consome a cota da IA; se o custo virar problema, o lugar de
     * pôr um limite por IP é aqui.
     */
    @PostMapping("/analisar")
    public EconomiaResponse analisar(@AuthenticationPrincipal Integer idAutenticado,
                                     @Valid @RequestBody EconomiaRequest request) {
        EconomiaResponse resposta = service.analisar(request);
        if (idAutenticado == null) {
            return resposta;
        }
        return historico.salvar(idAutenticado, resposta).map(resposta::comId).orElse(resposta);
    }

    @GetMapping("/historico")
    public List<AnaliseResumoResponse> listar(@AuthenticationPrincipal Integer idAutenticado) {
        return historico.listar(idAutenticado);
    }

    @GetMapping("/historico/{id}")
    public ResponseEntity<?> detalhe(@PathVariable Integer id, @AuthenticationPrincipal Integer idAutenticado) {
        return historico.buscar(id, idAutenticado)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(EconomiaController::naoEncontrada);
    }

    @DeleteMapping("/historico/{id}")
    public ResponseEntity<?> excluir(@PathVariable Integer id, @AuthenticationPrincipal Integer idAutenticado) {
        return historico.excluir(id, idAutenticado)
                ? ResponseEntity.noContent().build()
                : naoEncontrada();
    }

    private static ResponseEntity<?> naoEncontrada() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErroResponse.de(404, "Não encontrada", "Análise não encontrada."));
    }
}
