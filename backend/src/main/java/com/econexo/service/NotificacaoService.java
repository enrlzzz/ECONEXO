package com.econexo.service;

import com.econexo.dto.NotificacaoResponse;
import com.econexo.model.Notificacao;
import com.econexo.repository.NotificacaoRepository;
import com.econexo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Tipos em uso: MENSAGEM, CURTIDA, COMENTARIO, AVALIACAO e CREA.
 * O tipo é uma String (e não enum) para que um tipo novo no futuro não
 * quebre a leitura das linhas já gravadas.
 */
@Service
public class NotificacaoService {

    private final NotificacaoRepository repo;
    private final UsuarioRepository usuarios;

    public NotificacaoService(NotificacaoRepository repo, UsuarioRepository usuarios) {
        this.repo = repo;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> listar(Integer idUsuario) {
        return repo.findTop50ByUsuarioIdUsuarioOrderByCriadoEmDesc(idUsuario).stream()
                .map(NotificacaoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public long contarNaoLidas(Integer idUsuario) {
        return repo.countByUsuarioIdUsuarioAndLidaFalse(idUsuario);
    }

    /** Ninguém recebe notificação das próprias ações. */
    @Transactional
    public void criar(Integer destinatario, Integer ator, String tipo, String texto, Integer referencia) {
        if (destinatario.equals(ator)) return;

        Notificacao n = new Notificacao();
        n.setUsuario(usuarios.getReferenceById(destinatario));
        n.setAtor(usuarios.getReferenceById(ator));
        n.setTipo(tipo);
        n.setTexto(texto.length() > 255 ? texto.substring(0, 255) : texto);
        n.setReferenciaId(referencia);
        repo.save(n);
    }

    @Transactional
    public void marcarLidas(Integer idUsuario) {
        repo.marcarTodasComoLidas(idUsuario);
    }

    @Transactional
    public void marcarLida(Integer idUsuario, Integer idNotificacao) {
        repo.marcarUmaComoLida(idNotificacao, idUsuario);
    }
}
