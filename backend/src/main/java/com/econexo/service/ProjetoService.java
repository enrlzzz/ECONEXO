package com.econexo.service;

import com.econexo.dto.ProjetoRequest;
import com.econexo.dto.ProjetoResponse;
import com.econexo.exception.AcessoNegadoException;
import com.econexo.model.Projeto;
import com.econexo.model.Usuario;
import com.econexo.repository.ProjetoRepository;
import com.econexo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjetoService {

    private final ProjetoRepository repository;
    private final UsuarioRepository usuarioRepository;

    public ProjetoService(ProjetoRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjetoResponse> listarTodos() {
        return repository.findAll().stream().map(ProjetoResponse::de).toList();
    }

    /** O criador vem do token, nunca do corpo da requisição. */
    @Transactional
    public ProjetoResponse criar(Integer idAutenticado, ProjetoRequest req) {
        Usuario criador = usuarioRepository.findById(idAutenticado)
                .orElseThrow(() -> new AcessoNegadoException("Sessão inválida."));

        Projeto projeto = new Projeto();
        projeto.setCriador(criador);
        projeto.setTitulo(req.titulo().trim());
        projeto.setDescricao(req.descricao());
        projeto.setTipoProjeto(req.tipoProjeto());
        projeto.setStatus(req.status());
        projeto.setDataInicio(req.dataInicio());
        projeto.setDataFim(req.dataFim());
        projeto.setCidade(vazioViraNulo(req.cidade()));
        String uf = vazioViraNulo(req.estado());
        projeto.setEstado(uf == null ? null : uf.toUpperCase());
        projeto.setPotenciaKwp(req.potenciaKwp());

        return ProjetoResponse.de(repository.save(projeto));
    }

    private String vazioViraNulo(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }

    /** Só o criador exclui o próprio projeto. */
    @Transactional
    public void deletar(Integer id, Integer idAutenticado) {
        Projeto projeto = repository.findById(id)
                .orElseThrow(() -> new AcessoNegadoException("Projeto não encontrado."));

        if (projeto.getCriador() == null
                || !projeto.getCriador().getIdUsuario().equals(idAutenticado)) {
            throw new AcessoNegadoException("Você só pode excluir os seus próprios projetos.");
        }
        repository.delete(projeto);
    }
}
