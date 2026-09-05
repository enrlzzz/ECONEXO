package com.econexo.service;

import com.econexo.dto.AvaliacaoRequest;
import com.econexo.dto.AvaliacaoResponse;
import com.econexo.exception.AcessoNegadoException;
import com.econexo.exception.ValidacaoException;
import com.econexo.model.Avaliacao;
import com.econexo.model.Usuario;
import com.econexo.repository.AvaliacaoRepository;
import com.econexo.repository.ProjetoRepository;
import com.econexo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final ProjetoRepository projetoRepository;

    public AvaliacaoService(AvaliacaoRepository repository,
                            UsuarioRepository usuarioRepository,
                            ProjetoRepository projetoRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.projetoRepository = projetoRepository;
    }

    /** Reputação de um profissional — informação pública por natureza. */
    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> doUsuario(Integer idUsuario) {
        return repository.findByAvaliadoIdUsuario(idUsuario).stream()
                .map(AvaliacaoResponse::de)
                .toList();
    }

    /**
     * O avaliador é sempre o dono do token.
     *
     * Antes o controller recebia a entidade Avaliacao inteira, então bastava
     * mandar {"avaliador":{"idUsuario":9}} para fabricar uma nota assinada por
     * outra pessoa. Num sistema cujo produto é reputação, esse é o pior caso.
     */
    @Transactional
    public AvaliacaoResponse avaliar(Integer idAutenticado, AvaliacaoRequest req) {
        if (req.avaliadoId().equals(idAutenticado)) {
            throw new ValidacaoException("Não é possível avaliar a si mesmo.");
        }

        Usuario avaliador = usuarioRepository.findById(idAutenticado)
                .orElseThrow(() -> new AcessoNegadoException("Sessão inválida."));

        Usuario avaliado = usuarioRepository.findById(req.avaliadoId())
                .orElseThrow(() -> new ValidacaoException("Profissional avaliado não encontrado."));

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setAvaliador(avaliador);
        avaliacao.setAvaliado(avaliado);
        avaliacao.setEstrelas(req.estrelas());
        avaliacao.setComentario(req.comentario());

        if (req.projetoId() != null) {
            avaliacao.setProjeto(projetoRepository.findById(req.projetoId())
                    .orElseThrow(() -> new ValidacaoException("Projeto não encontrado.")));
        }

        return AvaliacaoResponse.de(repository.save(avaliacao));
    }
}
