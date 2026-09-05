package com.econexo.repository;

import com.econexo.model.PostCurtida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostCurtidaRepository extends JpaRepository<PostCurtida, Integer> {

    Optional<PostCurtida> findByPostIdPostAndUsuarioIdUsuario(Integer idPost, Integer idUsuario);

    /** Todas as curtidas dos posts listados — evita N+1 ao montar a timeline. */
    List<PostCurtida> findByPostIdPostIn(List<Integer> idsPost);

    void deleteByPostIdPost(Integer idPost);
}
