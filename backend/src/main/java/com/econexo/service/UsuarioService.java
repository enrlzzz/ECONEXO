package com.econexo.service;

import com.econexo.dto.ProfissionalBuscaResponse;
import com.econexo.dto.ProfissionalResponse;
import com.econexo.dto.UsuarioRequest;
import com.econexo.dto.UsuarioResponse;
import com.econexo.exception.AcessoNegadoException;
import com.econexo.exception.ValidacaoException;
import com.econexo.model.Usuario;
import com.econexo.repository.AvaliacaoRepository;
import com.econexo.repository.CredencialCreaRepository;
import com.econexo.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    /**
     * Hash descartável de uma senha qualquer, usado só para gastar tempo
     * quando o e-mail não existe (ver validarLogin).
     */
    private static final String HASH_FALSO =
            "$2a$12$C6UzMDM.H6dfI/f/IKcEe.4XHf/BbXFLhLLKgBAUpCH0e4fBJZ0Zq";

    /** Teto de resultados da busca: a tela não pagina, e 50 cartões já enchem a tela. */
    private static final int MAX_RESULTADOS_BUSCA = 50;

    private final UsuarioRepository usuarioRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final CredencialCreaRepository credencialCreaRepository;
    private final PasswordEncoder passwordEncoder;
    private final String versaoPolitica;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          AvaliacaoRepository avaliacaoRepository,
                          CredencialCreaRepository credencialCreaRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${econexo.lgpd.versao-politica:1.0}") String versaoPolitica) {
        this.usuarioRepository = usuarioRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.credencialCreaRepository = credencialCreaRepository;
        this.passwordEncoder = passwordEncoder;
        this.versaoPolitica = versaoPolitica;
    }

    @Transactional
    public UsuarioResponse criarUsuario(UsuarioRequest req) {
        // LGPD Art. 8º: o consentimento tem que ser inequívoco e comprovável.
        // Sem aceite, não há base legal para tratar CPF, telefone e localização.
        if (!Boolean.TRUE.equals(req.consentimentoLgpd())) {
            throw new ValidacaoException(
                    "É necessário aceitar a Política de Privacidade para criar a conta.");
        }

        // A senha só é obrigatória aqui, no cadastro. Na edição de perfil o
        // mesmo record vem sem ela e isso é legítimo (ver UsuarioRequest).
        if (req.senha() == null || req.senha().isBlank()) {
            throw new ValidacaoException("Senha é obrigatória.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(req.nome());
        usuario.setEmail(req.email().trim().toLowerCase());
        usuario.setSenha(passwordEncoder.encode(req.senha()));
        usuario.setCpf(vazioViraNulo(req.cpf()));
        usuario.setTelefone(vazioViraNulo(req.telefone()));
        usuario.setDataNascimento(req.dataNascimento());
        aplicarPerfil(usuario, req);

        // Prova do consentimento: o quê, quando e para qual versão do texto.
        usuario.setConsentimentoLgpd(true);
        usuario.setConsentimentoEm(LocalDateTime.now());
        usuario.setConsentimentoVersao(versaoPolitica);

        // E-mail duplicado sobe como DataIntegrityViolationException e o
        // GlobalExceptionHandler devolve mensagem genérica — de propósito,
        // para o cadastro não virar um verificador de "quem tem conta aqui".
        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }

    /**
     * Valida credenciais.
     *
     * Quando o e-mail não existe, compara a senha contra um hash falso em vez
     * de retornar na hora. Sem isso, "e-mail inexistente" responde em ~1ms e
     * "senha errada" em ~250ms (custo do BCrypt) — e essa diferença de tempo,
     * sozinha, revela quais e-mails têm conta na plataforma.
     */
    public Optional<Usuario> validarLogin(String email, String senha) {
        // De propósito SEM @Transactional: o findByEmail do repositório já abre
        // e fecha a sua própria transação. Com a anotação aqui, a conexão do
        // banco ficava presa durante o BCrypt inteiro (centenas de ms, ou
        // segundos num servidor com pouca CPU) — e com um pool de poucas
        // conexões, alguns logins simultâneos travavam o resto da API.
        long inicio = System.nanoTime();
        Optional<Usuario> encontrado =
                usuarioRepository.findByEmail(email == null ? "" : email.trim().toLowerCase());
        long consultaMs = (System.nanoTime() - inicio) / 1_000_000;

        String senhaInformada = senha == null ? "" : senha;

        long antesBcrypt = System.nanoTime();
        boolean confere;
        if (encontrado.isEmpty()) {
            passwordEncoder.matches(senhaInformada, HASH_FALSO);
            confere = false;
        } else {
            confere = passwordEncoder.matches(senhaInformada, encontrado.get().getSenha());
        }
        long bcryptMs = (System.nanoTime() - antesBcrypt) / 1_000_000;

        // Medição para achar o gargalo do login em produção. Sem e-mail nem
        // qualquer dado do usuário no log — só os tempos.
        log.info("login: consulta ao banco={}ms, bcrypt={}ms", consultaMs, bcryptMs);

        return confere ? encontrado : Optional.empty();
    }

    /**
     * O cadastro completo (com e-mail e telefone) só sai para o próprio dono.
     * Para qualquer outra pessoa, devolve o cartão público.
     */
    @Transactional(readOnly = true)
    public Optional<Object> buscarPorId(Integer id, Integer idAutenticado) {
        return usuarioRepository.findById(id)
                .map(u -> id.equals(idAutenticado)
                        ? (Object) UsuarioResponse.de(u)
                        : (Object) ProfissionalResponse.de(u));
    }

    /**
     * Diretório de usuários.
     *
     * Responde ProfissionalResponse, não UsuarioResponse: antes esta rota
     * entregava o e-mail de TODA a base para qualquer usuário logado — um
     * raspador de e-mails a uma requisição de distância.
     */
    @Transactional(readOnly = true)
    public List<ProfissionalResponse> listarTodos() {
        return usuarioRepository.findAll().stream().map(ProfissionalResponse::de).toList();
    }

    /**
     * Atualiza o cadastro. O id vem do TOKEN, não da URL: sem essa checagem,
     * PUT /api/usuarios/2 autenticado como usuário 1 editava a conta alheia.
     */
    @Transactional
    public UsuarioResponse atualizarUsuario(Integer idAlvo, Integer idAutenticado, UsuarioRequest req) {
        if (!idAlvo.equals(idAutenticado)) {
            throw new AcessoNegadoException("Você só pode alterar o seu próprio cadastro.");
        }

        Usuario usuario = usuarioRepository.findById(idAlvo)
                .orElseThrow(() -> new AcessoNegadoException("Cadastro não encontrado."));

        usuario.setNome(req.nome());
        usuario.setEmail(req.email().trim().toLowerCase());
        usuario.setCpf(vazioViraNulo(req.cpf()));
        usuario.setTelefone(vazioViraNulo(req.telefone()));
        usuario.setDataNascimento(req.dataNascimento());
        aplicarPerfil(usuario, req);

        // Senha só muda se vier preenchida — e sempre re-hasheada.
        if (req.senha() != null && !req.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(req.senha()));
        }

        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }

    @Transactional
    public void deletarUsuario(Integer idAlvo, Integer idAutenticado) {
        if (!idAlvo.equals(idAutenticado)) {
            throw new AcessoNegadoException("Você só pode excluir a sua própria conta.");
        }
        usuarioRepository.deleteById(idAlvo);
    }

    /**
     * Busca de profissionais.
     *
     * Devolve ProfissionalBuscaResponse, não UsuarioResponse: o diretório é
     * visível a qualquer usuário logado, e e-mail/telefone de terceiros não
     * têm por que trafegar numa listagem de busca. O próprio usuário não
     * aparece no resultado.
     *
     * Filtros vazios são ignorados. O filtro roda no banco e a reputação e o
     * selo de CREA vêm em UMA consulta cada (não uma por profissional).
     */
    @Transactional(readOnly = true)
    public List<ProfissionalBuscaResponse> buscarProfissionais(Integer idAutenticado, String nome,
                                                               String cidade, String estado, String tipo) {
        List<Usuario> encontrados = usuarioRepository.buscar(
                idAutenticado == null ? -1 : idAutenticado,
                filtroBusca(nome).toLowerCase(),
                filtroBusca(cidade).toLowerCase(),
                filtroBusca(estado).toUpperCase(),
                filtroBusca(tipo).toUpperCase(),
                PageRequest.of(0, MAX_RESULTADOS_BUSCA));

        if (encontrados.isEmpty()) return List.of();

        List<Integer> ids = encontrados.stream().map(Usuario::getIdUsuario).toList();

        Map<Integer, AvaliacaoRepository.Resumo> resumos = avaliacaoRepository.resumoPorUsuario(ids).stream()
                .collect(Collectors.toMap(AvaliacaoRepository.Resumo::getIdUsuario, Function.identity()));

        Set<Integer> comCreaVerificado = credencialCreaRepository
                .findByUsuarioIdUsuarioInAndStatus(ids, ValidacaoService.VERIFICADA).stream()
                .map(c -> c.getUsuario().getIdUsuario())
                .collect(Collectors.toSet());

        return encontrados.stream().map(u -> {
            AvaliacaoRepository.Resumo r = resumos.get(u.getIdUsuario());
            return new ProfissionalBuscaResponse(
                    u.getIdUsuario(), u.getNome(), u.getCidade(), u.getEstado(),
                    u.getTipoProfissional(),
                    r == null || r.getMedia() == null ? null : Math.round(r.getMedia() * 10.0) / 10.0,
                    r == null || r.getTotal() == null ? 0L : r.getTotal(),
                    comCreaVerificado.contains(u.getIdUsuario()));
        }).toList();
    }

    /**
     * Texto de busca seguro para o LIKE: tira os curingas (% _ \) que a
     * pessoa digitou, para "100%" não virar "qualquer coisa". Vazio vira "".
     */
    private String filtroBusca(String valor) {
        if (valor == null) return "";
        String limpo = valor.trim().replaceAll("[%_\\\\]", "");
        return limpo.length() > 100 ? limpo.substring(0, 100) : limpo;
    }

    /**
     * Campos de perfil profissional. Ficam separados porque, ao contrário de
     * nome/e-mail, são opcionais e valem tanto no cadastro quanto na edição.
     */
    private void aplicarPerfil(Usuario usuario, UsuarioRequest req) {
        usuario.setCidade(vazioViraNulo(req.cidade()));
        String uf = vazioViraNulo(req.estado());
        usuario.setEstado(uf == null ? null : uf.toUpperCase());
        usuario.setTipoProfissional(vazioViraNulo(req.tipoProfissional()));
    }

    /** Coluna com UNIQUE trata múltiplos "" como duplicata; NULL não. */
    private String vazioViraNulo(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }
}
