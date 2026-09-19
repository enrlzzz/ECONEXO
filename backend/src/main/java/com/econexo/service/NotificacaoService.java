package com.econexo.service;
import com.econexo.dto.NotificacaoResponse;
import com.econexo.model.*;
import com.econexo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service public class NotificacaoService {
 private final NotificacaoRepository repo; private final UsuarioRepository usuarios;
 public NotificacaoService(NotificacaoRepository repo, UsuarioRepository usuarios){this.repo=repo;this.usuarios=usuarios;}
 @Transactional(readOnly=true) public List<NotificacaoResponse> listar(Integer id){return repo.findTop50ByUsuarioIdUsuarioOrderByCriadoEmDesc(id).stream().map(NotificacaoResponse::de).toList();}
 @Transactional public void criar(Integer destinatario,Integer ator,String tipo,String texto,Integer referencia){if(destinatario.equals(ator))return; var n=new Notificacao();n.setUsuario(usuarios.getReferenceById(destinatario));n.setAtor(usuarios.getReferenceById(ator));n.setTipo(tipo);n.setTexto(texto);n.setReferenciaId(referencia);repo.save(n);}
 @Transactional public void marcarLidas(Integer id){repo.findTop50ByUsuarioIdUsuarioOrderByCriadoEmDesc(id).forEach(n->n.setLida(true));}
}
