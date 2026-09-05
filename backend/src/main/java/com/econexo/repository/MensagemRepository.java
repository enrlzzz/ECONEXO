package com.econexo.repository;

import com.econexo.model.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MensagemRepository extends JpaRepository<Mensagem, Integer> {

    /**
     * Tudo que o usuário enviou ou recebeu, mais antigo primeiro.
     * O agrupamento por conversa é feito no service.
     */
    @Query("""
           SELECT m FROM Mensagem m
           WHERE m.remetente.idUsuario = :idUsuario
              OR m.destinatario.idUsuario = :idUsuario
           ORDER BY m.criadoEm ASC
           """)
    List<Mensagem> daCaixaDe(@Param("idUsuario") Integer idUsuario);

    /** Conversa entre duas pessoas, nos dois sentidos. */
    @Query("""
           SELECT m FROM Mensagem m
           WHERE (m.remetente.idUsuario = :a AND m.destinatario.idUsuario = :b)
              OR (m.remetente.idUsuario = :b AND m.destinatario.idUsuario = :a)
           ORDER BY m.criadoEm ASC
           """)
    List<Mensagem> entre(@Param("a") Integer a, @Param("b") Integer b);
}
