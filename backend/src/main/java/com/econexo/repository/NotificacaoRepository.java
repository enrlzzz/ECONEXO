package com.econexo.repository;

import com.econexo.model.Notificacao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Integer> {

    /**
     * As 50 mais recentes do usuário. O @EntityGraph traz o autor da ação
     * junto: sem ele, cada notificação disparava um SELECT extra só para ler
     * o nome de quem curtiu/comentou/avaliou.
     */
    @EntityGraph(attributePaths = "ator")
    List<Notificacao> findTop50ByUsuarioIdUsuarioOrderByCriadoEmDesc(Integer idUsuario);

    /** Alimenta o contador do sino no cabeçalho. */
    long countByUsuarioIdUsuarioAndLidaFalse(Integer idUsuario);

    /** Um UPDATE só, em vez de carregar e salvar cada notificação. */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notificacao n SET n.lida = true "
         + "WHERE n.usuario.idUsuario = :idUsuario AND n.lida = false")
    int marcarTodasComoLidas(@Param("idUsuario") Integer idUsuario);

    /** Confere o dono na própria cláusula: ninguém marca a notificação alheia. */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notificacao n SET n.lida = true "
         + "WHERE n.idNotificacao = :id AND n.usuario.idUsuario = :idUsuario")
    int marcarUmaComoLida(@Param("id") Integer id, @Param("idUsuario") Integer idUsuario);
}
