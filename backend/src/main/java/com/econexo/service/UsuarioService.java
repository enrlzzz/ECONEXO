package com.econexo.service;

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

        Usuario usuario = new Usuario();
        usuario.setNome(req.nome());
        usuario.setEmail(req.email().trim().toLowerCase());
        usuario.setSenha(passwordEncoder.encode(req.senha()));
        usuario.setCpf(vazioViraNulo(req.cpf()));
        usuario.setTelefone(vazioViraNulo(req.telefone()));
        usuario.setDataNascimento(req.dataNascimento());

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

    @Transactional(readOnly = true)
    public Optional<UsuarioResponse> buscarPorId(Integer id) {
        return usuarioRepository.findById(id).map(UsuarioResponse::de);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::de).toList();
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

    /** Coluna com UNIQUE trata múltiplos "" como duplicata; NULL não. */
    private String vazioViraNulo(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }
}
