package com.econexo.service;

import com.econexo.dto.ProfissionalResponse;
import com.econexo.dto.UsuarioRequest;
import com.econexo.dto.UsuarioResponse;
import com.econexo.exception.AcessoNegadoException;
import com.econexo.exception.ValidacaoException;
import com.econexo.model.Usuario;
import com.econexo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    /**
     * Hash descartável de uma senha qualquer, usado só para gastar tempo
     * quando o e-mail não existe (ver validarLogin).
     */
    private static final String HASH_FALSO =
            "$2a$12$C6UzMDM.H6dfI/f/IKcEe.4XHf/BbXFLhLLKgBAUpCH0e4fBJZ0Zq";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String versaoPolitica;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${econexo.lgpd.versao-politica:1.0}") String versaoPolitica) {
        this.usuarioRepository = usuarioRepository;
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
    @Transactional(readOnly = true)
    public Optional<Usuario> validarLogin(String email, String senha) {
        Optional<Usuario> encontrado =
                usuarioRepository.findByEmail(email == null ? "" : email.trim().toLowerCase());

        if (encontrado.isEmpty()) {
            passwordEncoder.matches(senha == null ? "" : senha, HASH_FALSO);
            return Optional.empty();
        }

        Usuario usuario = encontrado.get();
        if (!passwordEncoder.matches(senha == null ? "" : senha, usuario.getSenha())) {
            return Optional.empty();
        }
        return Optional.of(usuario);
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
     * Devolve ProfissionalResponse, não UsuarioResponse: o diretório é visível
     * a qualquer usuário logado, e e-mail/telefone de terceiros não têm por que
     * trafegar numa listagem de busca.
     *
     * Filtros vazios são ignorados — sem nenhum filtro, lista todo mundo.
     */
    @Transactional(readOnly = true)
    public List<ProfissionalResponse> buscarProfissionais(String nome, String cidade,
                                                          String estado, String tipo) {
        String nomeFiltro = normalizar(nome);
        String cidadeFiltro = normalizar(cidade);
        String estadoFiltro = normalizar(estado);
        String tipoFiltro = normalizar(tipo);

        return usuarioRepository.findAll().stream()
                .filter(u -> nomeFiltro == null
                        || (u.getNome() != null
                            && u.getNome().toLowerCase().contains(nomeFiltro)))
                .filter(u -> cidadeFiltro == null
                        || (u.getCidade() != null
                            && u.getCidade().toLowerCase().contains(cidadeFiltro)))
                .filter(u -> estadoFiltro == null
                        || estadoFiltro.equalsIgnoreCase(u.getEstado()))
                .filter(u -> tipoFiltro == null
                        || tipoFiltro.equalsIgnoreCase(u.getTipoProfissional()))
                .map(ProfissionalResponse::de)
                .toList();
    }

    private String normalizar(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim().toLowerCase();
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
