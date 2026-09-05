package com.econexo.repository;

import com.econexo.model.PostComentario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostComentarioRepository extends JpaRepository<PostComentario, Integer> {

    List<PostComentario> findByPostIdPostOrderByCriadoEmAsc(Integer idPost);

    /**
     * Carrega os comentários de vários posts de uma vez. Sem isto, montar a
     * timeline faria uma consulta por post (N+1) — com 50 posts na tela, 50
     * idas ao banco a cada carregamento.
     */
    List<PostComentario> findByPostIdPostInOrderByCriadoEmAsc(List<Integer> idsPost);

    void deleteByPostIdPost(Integer idPost);
}
