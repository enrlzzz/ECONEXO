package com.econexo.repository;

import com.econexo.model.CredencialCrea;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CredencialCreaRepository extends JpaRepository<CredencialCrea, Integer> {

    Optional<CredencialCrea> findByUsuarioIdUsuario(Integer idUsuario);

    /** Fila do administrador, mais antiga primeiro. O usuário vem junto (evita N+1). */
    @EntityGraph(attributePaths = "usuario")
    List<CredencialCrea> findByStatusOrderByCriadoEmAsc(String status);

    /** Quais dos profissionais da busca têm CREA verificado — uma consulta para todos. */
    @EntityGraph(attributePaths = "usuario")
    List<CredencialCrea> findByUsuarioIdUsuarioInAndStatus(Collection<Integer> idsUsuario, String status);

    /** Um registro verificado não pode estar vinculado a duas contas. */
    boolean existsByRegistroAndUfAndStatusAndUsuarioIdUsuarioNot(
            String registro, String uf, String status, Integer idUsuario);
}
