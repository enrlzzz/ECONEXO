package com.econexo.service;

import com.econexo.dto.AnaliseDetalheResponse;
import com.econexo.dto.AnaliseResumoResponse;
import com.econexo.dto.EconomiaResponse;
import com.econexo.dto.MesConta;
import com.econexo.model.AnaliseConta;
import com.econexo.repository.AnaliseContaRepository;
import com.econexo.repository.UsuarioRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

/**
 * Histórico de análises. Toda leitura e exclusão filtra pelo id do TOKEN
 * (regra 6 do CLAUDE.md): o id da análise sozinho não abre nada.
 */
@Service
public class AnaliseContaService {

    private final AnaliseContaRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public AnaliseContaService(AnaliseContaRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    /** Guarda a análise e devolve o id. Resposta sem análise (erro da IA) não é salva. */
    @Transactional
    public Optional<Integer> salvar(Integer idUsuario, EconomiaResponse resposta) {
        if (!resposta.temAnalise()) {
            return Optional.empty();
        }
        AnaliseConta a = new AnaliseConta();
        a.setUsuario(usuarioRepository.getReferenceById(idUsuario));
        a.setResumo(cortar(resposta.resumo(), 200));
        a.setAnalise(resposta.analise());
        a.setMesesJson(paraJson(resposta.meses()));
        a.setConsumoMedioKwh(media(resposta.meses(), MesConta::consumoKwh));
        a.setValorMedio(media(resposta.meses(), MesConta::valorReais));
        a.setEconomiaSolarMensal(resposta.economiaSolarMensal());
        return Optional.of(repository.save(a).getIdAnalise());
    }

    @Transactional(readOnly = true)
    public List<AnaliseResumoResponse> listar(Integer idUsuario) {
        return repository.findByUsuarioIdUsuarioOrderByCriadaEmDesc(idUsuario).stream()
                .map(a -> new AnaliseResumoResponse(a.getIdAnalise(), a.getCriadaEm(), a.getResumo(),
                        periodo(deJson(a.getMesesJson())), a.getConsumoMedioKwh(), a.getValorMedio()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<AnaliseDetalheResponse> buscar(Integer idAnalise, Integer idUsuario) {
        return repository.findByIdAnaliseAndUsuarioIdUsuario(idAnalise, idUsuario)
                .map(a -> new AnaliseDetalheResponse(a.getIdAnalise(), a.getCriadaEm(), a.getResumo(),
                        a.getAnalise(), deJson(a.getMesesJson()), a.getConsumoMedioKwh(),
                        a.getValorMedio(), a.getEconomiaSolarMensal()));
    }

    /** true se apagou; false se não existe ou é de outra pessoa (mesma resposta, de propósito). */
    @Transactional
    public boolean excluir(Integer idAnalise, Integer idUsuario) {
        return repository.findByIdAnaliseAndUsuarioIdUsuario(idAnalise, idUsuario)
                .map(a -> { repository.delete(a); return true; })
                .orElse(false);
    }

    private static BigDecimal media(List<MesConta> meses, Function<MesConta, BigDecimal> campo) {
        List<BigDecimal> valores = meses == null ? List.of()
                : meses.stream().map(campo).filter(Objects::nonNull).toList();
        if (valores.isEmpty()) return null;
        return valores.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(valores.size()), 2, RoundingMode.HALF_UP);
    }

    /** "07/2026 – 09/2026", ou nulo se a IA não achou as referências. */
    private static String periodo(List<MesConta> meses) {
        List<String> refs = meses.stream().map(MesConta::referencia)
                .filter(r -> r != null && !r.isBlank()).toList();
        if (refs.isEmpty()) return null;
        return refs.size() == 1 ? refs.get(0) : refs.get(0) + " – " + refs.get(refs.size() - 1);
    }

    private String paraJson(List<MesConta> meses) {
        try {
            return mapper.writeValueAsString(meses == null ? List.of() : meses);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<MesConta> deJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return mapper.readValue(json, new TypeReference<List<MesConta>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private static String cortar(String s, int max) {
        return s.length() > max ? s.substring(0, max - 1) + "…" : s;
    }
}
