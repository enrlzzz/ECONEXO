package com.econexo.repository;

import com.econexo.model.Post;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Integer> {

    /**
     * Timeline: mais recente primeiro.
     *
     * O @EntityGraph traz o autor na MESMA consulta. Post.autor é um
     * @ManyToOne, que no JPA é EAGER por padrão: sem o grafo, o Hibernate
     * faz um SELECT extra por autor distinto — e cada SELECT é uma ida ao
     * MySQL da Hostinger. A timeline é a primeira tela depois do login.
     */
    @EntityGraph(attributePaths = "autor")
    List<Post> findAllByOrderByCriadoEmDesc();
}
