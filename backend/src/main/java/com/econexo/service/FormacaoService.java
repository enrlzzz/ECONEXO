package com.econexo.service;

import com.econexo.dto.FormacaoRequest;
import com.econexo.dto.FormacaoResponse;
import com.econexo.exception.AcessoNegadoException;
import com.econexo.model.Formacao;
import com.econexo.model.Usuario;
import com.econexo.repository.FormacaoRepository;
import com.econexo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FormacaoService {

    private final FormacaoRepository repository;
    private final UsuarioRepository usuarioRepository;

    public FormacaoService(FormacaoRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    /** Formação de um profissional — parte pública do currículo. */
    @Transactional(readOnly = true)
    public List<FormacaoResponse> doUsuario(Integer idUsuario) {
        return repository.findByUsuarioIdUsuario(idUsuario).stream()
                .map(FormacaoResponse::de)
                .toList();
    }

    /** O dono vem do token: ninguém cadastra formação no currículo alheio. */
    @Transactional
    public FormacaoResponse salvar(Integer idAutenticado, FormacaoRequest req) {
        Usuario dono = usuarioRepository.findById(idAutenticado)
                .orElseThrow(() -> new AcessoNegadoException("Sessão inválida."));

        Formacao formacao = new Formacao();
        formacao.setUsuario(dono);
        formacao.setInstituicao(req.instituicao().trim());
        formacao.setDiploma(req.diploma());
        formacao.setDataInicio(req.dataInicio());
        formacao.setDataFim(req.dataFim());

        return FormacaoResponse.de(repository.save(formacao));
    }

    @Transactional
    public void excluir(Integer id, Integer idAutenticado) {
        Formacao formacao = repository.findById(id)
                .orElseThrow(() -> new AcessoNegadoException("Formação não encontrada."));

        if (formacao.getUsuario() == null
                || !formacao.getUsuario().getIdUsuario().equals(idAutenticado)) {
            throw new AcessoNegadoException("Você só pode excluir as suas próprias formações.");
        }
        repository.delete(formacao);
    }
}
