package com.econexo.repository;

import com.econexo.model.Avaliacao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {

    /**
     * Avaliador e avaliado vêm na mesma consulta (os dois são @ManyToOne
     * EAGER por padrão e, sem o grafo, cada avaliação gerava SELECTs extras).
     */
    @EntityGraph(attributePaths = {"avaliador", "avaliado"})
    List<Avaliacao> findByAvaliadoIdUsuario(Integer idUsuario);

    /** Uma pessoa avalia a outra uma vez por projeto... */
    boolean existsByAvaliadorIdUsuarioAndAvaliadoIdUsuarioAndProjetoIdProjeto(
            Integer idAvaliador, Integer idAvaliado, Integer idProjeto);

    /** ...e uma vez só quando a avaliação não está ligada a projeto. */
    boolean existsByAvaliadorIdUsuarioAndAvaliadoIdUsuarioAndProjetoIsNull(
            Integer idAvaliador, Integer idAvaliado);

    /** Média e quantidade de vários profissionais numa consulta só (busca). */
    interface Resumo {
        Integer getIdUsuario();
        Double getMedia();
        Long getTotal();
    }

    @Query("SELECT a.avaliado.idUsuario AS idUsuario, AVG(a.estrelas) AS media, COUNT(a) AS total "
         + "FROM Avaliacao a WHERE a.avaliado.idUsuario IN :ids GROUP BY a.avaliado.idUsuario")
    List<Resumo> resumoPorUsuario(@Param("ids") Collection<Integer> ids);
}
