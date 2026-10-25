package com.econexo.service;

import com.econexo.dto.CreaPendenteResponse;
import com.econexo.dto.CreaValidationRequest;
import com.econexo.dto.CreaValidationResponse;
import com.econexo.exception.AcessoNegadoException;
import com.econexo.exception.RegraNegocioException;
import com.econexo.exception.ValidacaoException;
import com.econexo.model.CredencialCrea;
import com.econexo.model.Usuario;
import com.econexo.repository.CredencialCreaRepository;
import com.econexo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Credencial CREA.
 *
 * POR QUE NÃO CONSULTAMOS O PORTAL AUTOMATICAMENTE
 * A versão anterior fazia um GET na página inicial do CREA com ?nome=&registro=
 * e procurava o número no HTML que voltava. Isso nunca funcionou de verdade:
 * a página inicial ignora esses parâmetros, e a consulta pública de
 * profissionais é um formulário do próprio portal de cada conselho, sem API
 * documentada. Raspar esse formulário seria frágil (qualquer mudança no site
 * quebra) e, se houver captcha, contorná-lo não é algo que o projeto deva fazer.
 *
 * O que fazemos no lugar, e é honesto sobre o que verifica:
 *  1. o profissional informa nome, registro e UF -> fica PENDENTE;
 *  2. validamos o formato (UF existente, registro plausível);
 *  3. um administrador confere na consulta pública do conselho da UF (o link
 *     vai junto na resposta) e aprova ou rejeita;
 *  4. só então o perfil mostra "CREA verificado".
 */
@Service
public class ValidacaoService {

    public static final String NAO_VINCULADA = "NAO_VINCULADA";
    public static final String PENDENTE = "PENDENTE";
    public static final String VERIFICADA = "VERIFICADA";
    public static final String REJEITADA = "REJEITADA";

    private static final String FONTE_PADRAO = "https://www.confea.org.br/";

    private static final Set<String> UFS = Set.of(
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
            "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO");

    /** Portal de cada conselho. A consulta de profissionais fica dentro dele. */
    private static final Map<String, String> FONTES = Map.ofEntries(
            Map.entry("SP", "https://www.creasp.org.br/"), Map.entry("AC", "https://www.creaac.org.br/"),
            Map.entry("AL", "https://www.crea-al.org.br/"), Map.entry("AM", "https://www.crea-am.org.br/"),
            Map.entry("BA", "https://www.creaba.org.br/"), Map.entry("CE", "https://www.creace.org.br/"),
            Map.entry("DF", "https://www.creadf.org.br/"), Map.entry("ES", "https://www.creaes.org.br/"),
            Map.entry("GO", "https://www.creago.org.br/"), Map.entry("MG", "https://www.crea-mg.org.br/"),
            Map.entry("MS", "https://www.creams.org.br/"), Map.entry("MT", "https://www.crea-mt.org.br/"),
            Map.entry("PA", "https://www.creapa.org.br/"), Map.entry("PB", "https://creapb.org.br/"),
            Map.entry("PE", "https://www.creape.org.br/"), Map.entry("PR", "https://www.crea-pr.org.br/"),
            Map.entry("RJ", "https://www.crea-rj.org.br/"), Map.entry("RN", "https://www.crea-rn.org.br/"),
            Map.entry("RS", "https://www.crea-rs.org.br/"), Map.entry("SC", "https://portal.crea-sc.org.br/"),
            Map.entry("SE", "https://www.crea-se.org.br/"), Map.entry("TO", "https://www.crea-to.org.br/")
    );

    private final CredencialCreaRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoService notificacaoService;

    public ValidacaoService(CredencialCreaRepository repository,
                            UsuarioRepository usuarioRepository,
                            NotificacaoService notificacaoService) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.notificacaoService = notificacaoService;
    }

    /** O profissional pede a verificação do PRÓPRIO registro (o id vem do token). */
    @Transactional
    public CreaValidationResponse solicitar(Integer idAutenticado, CreaValidationRequest req) {
        String uf = req.uf().trim().toUpperCase();
        if (!UFS.contains(uf)) {
            throw new ValidacaoException("UF inválida.");
        }

        String registro = normalizarRegistro(req.registro());
        if (!registro.matches("[0-9A-Z]{4,15}")) {
            throw new ValidacaoException(
                    "Número de registro inválido. Informe só o número do CREA, sem texto extra.");
        }

        Usuario usuario = usuarioRepository.findById(idAutenticado)
                .orElseThrow(() -> new AcessoNegadoException("Sessão inválida."));

        CredencialCrea atual = repository.findByUsuarioIdUsuario(idAutenticado).orElse(null);
        boolean mesmosDados = atual != null
                && registro.equals(atual.getRegistro()) && uf.equals(atual.getUf());

        // Reenviar os mesmos dados não reabre análise nem apaga uma aprovação.
        if (mesmosDados) {
            return resposta(atual);
        }

        if (repository.existsByRegistroAndUfAndStatusAndUsuarioIdUsuarioNot(
                registro, uf, VERIFICADA, idAutenticado)) {
            throw new RegraNegocioException("Este registro já está vinculado a outra conta.");
        }

        CredencialCrea credencial = atual != null ? atual : new CredencialCrea();
        credencial.setUsuario(usuario);
        credencial.setRegistro(registro);
        credencial.setUf(uf);
        credencial.setNomeRegistro(limitar(req.nome().trim(), 100));
        credencial.setStatus(PENDENTE);
        credencial.setObservacao(null);
        credencial.setCriadoEm(LocalDateTime.now());
        credencial.setAvaliadoEm(null);
        credencial.setAvaliadoPor(null);

        return resposta(repository.save(credencial));
    }

    @Transactional(readOnly = true)
    public CreaValidationResponse minha(Integer idAutenticado) {
        return repository.findByUsuarioIdUsuario(idAutenticado)
                .map(this::resposta)
                .orElse(new CreaValidationResponse(NAO_VINCULADA,
                        "Nenhum registro CREA vinculado ainda.", null, null, null));
    }

    /** Fila de conferência. Só administrador. */
    @Transactional(readOnly = true)
    public List<CreaPendenteResponse> pendentes(Integer idAutenticado) {
        exigirAdmin(idAutenticado);
        return repository.findByStatusOrderByCriadoEmAsc(PENDENTE).stream()
                .map(c -> new CreaPendenteResponse(
                        c.getIdCredencial(),
                        c.getUsuario().getIdUsuario(),
                        c.getUsuario().getNome(),
                        c.getNomeRegistro(),
                        c.getRegistro(),
                        c.getUf(),
                        fonte(c.getUf()),
                        c.getCriadoEm()))
                .toList();
    }

    /** Decisão do administrador, depois de conferir na consulta pública do conselho. */
    @Transactional
    public CreaValidationResponse decidir(Integer idAdmin, Integer idCredencial,
                                          boolean aprovada, String observacao) {
        exigirAdmin(idAdmin);

        CredencialCrea credencial = repository.findById(idCredencial)
                .orElseThrow(() -> new ValidacaoException("Solicitação não encontrada."));

        if (!PENDENTE.equals(credencial.getStatus())) {
            throw new RegraNegocioException("Esta solicitação já foi analisada.");
        }

        Integer idDono = credencial.getUsuario().getIdUsuario();

        if (aprovada && repository.existsByRegistroAndUfAndStatusAndUsuarioIdUsuarioNot(
                credencial.getRegistro(), credencial.getUf(), VERIFICADA, idDono)) {
            throw new RegraNegocioException("Este registro já está verificado em outra conta.");
        }

        String obs = (observacao == null || observacao.isBlank()) ? null : observacao.trim();

        credencial.setStatus(aprovada ? VERIFICADA : REJEITADA);
        credencial.setObservacao(obs);
        credencial.setAvaliadoEm(LocalDateTime.now());
        credencial.setAvaliadoPor(idAdmin);

        notificacaoService.criar(idDono, idAdmin, "CREA",
                aprovada
                        ? "Seu registro CREA foi verificado."
                        : "Seu registro CREA não foi aprovado." + (obs != null ? " Motivo: " + obs : ""),
                credencial.getIdCredencial());

        return resposta(credencial);
    }

    // ------------------------------------------------------------------ apoio

    private void exigirAdmin(Integer idUsuario) {
        boolean admin = usuarioRepository.findById(idUsuario)
                .map(u -> Boolean.TRUE.equals(u.getAdmin()))
                .orElse(false);
        if (!admin) {
            throw new AcessoNegadoException("Apenas administradores podem fazer isso.");
        }
    }

    private CreaValidationResponse resposta(CredencialCrea c) {
        String mensagem = switch (c.getStatus()) {
            case VERIFICADA -> "Registro conferido na consulta pública do CREA.";
            case REJEITADA -> "O registro não confere com a consulta pública do CREA."
                    + (c.getObservacao() != null ? " Motivo: " + c.getObservacao() : "")
                    + " Corrija os dados e envie de novo.";
            default -> "Registro enviado. Um administrador vai conferir na consulta pública do CREA-"
                    + c.getUf() + " antes de liberar o selo.";
        };
        return new CreaValidationResponse(c.getStatus(), mensagem, fonte(c.getUf()),
                c.getRegistro(), c.getUf());
    }

    private String fonte(String uf) {
        return FONTES.getOrDefault(uf, FONTE_PADRAO);
    }

    /** Tira pontos, traços, barras e espaços: "5.061.234-567/D" vira "5061234567D". */
    private String normalizarRegistro(String registro) {
        return registro == null ? "" : registro.replaceAll("[\\s.\\-/]", "").toUpperCase();
    }

    private String limitar(String texto, int max) {
        return texto.length() > max ? texto.substring(0, max) : texto;
    }
}
