package com.econexo.service;

import com.econexo.dto.EnderecoRequest;
import com.econexo.dto.EnderecoResponse;
import com.econexo.exception.AcessoNegadoException;
import com.econexo.model.Endereco;
import com.econexo.model.Usuario;
import com.econexo.repository.EnderecoRepository;
import com.econexo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Endereço é o dado mais sensível fora de senha e CPF.
 *
 * A versão anterior fazia findAll() e devolvia a entidade: qualquer usuário
 * logado recebia CEP, logradouro, número e coordenadas de toda a base. Aqui
 * TODA consulta é filtrada pelo id do token — não existe listagem global.
 */
@Service
public class EnderecoService {

    private final EnderecoRepository repository;
    private final UsuarioRepository usuarioRepository;

    public EnderecoService(EnderecoRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<EnderecoResponse> meusEnderecos(Integer idAutenticado) {
        return repository.findByUsuarioIdUsuario(idAutenticado).stream()
                .map(EnderecoResponse::de)
                .toList();
    }

    @Transactional
    public EnderecoResponse salvar(Integer idAutenticado, EnderecoRequest req) {
        Usuario dono = usuarioRepository.findById(idAutenticado)
                .orElseThrow(() -> new AcessoNegadoException("Sessão inválida."));

        Endereco endereco = new Endereco();
        endereco.setUsuario(dono);
        endereco.setCep(req.cep());
        endereco.setCidade(req.cidade());
        endereco.setEstado(req.estado());
        endereco.setLogradouro(req.logradouro());
        endereco.setNumero(req.numero());
        endereco.setLatitude(req.latitude());
        endereco.setLongitude(req.longitude());

        return EnderecoResponse.de(repository.save(endereco));
    }

    @Transactional
    public void excluir(Integer id, Integer idAutenticado) {
        Endereco endereco = repository.findById(id)
                .orElseThrow(() -> new AcessoNegadoException("Endereço não encontrado."));

        if (endereco.getUsuario() == null
                || !endereco.getUsuario().getIdUsuario().equals(idAutenticado)) {
            throw new AcessoNegadoException("Você só pode excluir os seus próprios endereços.");
        }
        repository.delete(endereco);
    }
}
