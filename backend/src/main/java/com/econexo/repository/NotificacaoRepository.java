package com.econexo.repository;
import com.econexo.model.Notificacao;
import org.springframework.data.jpa.repository.*;
import java.util.List;
public interface NotificacaoRepository extends JpaRepository<Notificacao,Integer> { List<Notificacao> findTop50ByUsuarioIdUsuarioOrderByCriadoEmDesc(Integer id); }
