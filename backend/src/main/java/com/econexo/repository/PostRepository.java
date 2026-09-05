package com.econexo.repository;

import com.econexo.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Integer> {

    /** Timeline: mais recente primeiro. */
    List<Post> findAllByOrderByCriadoEmDesc();
}
