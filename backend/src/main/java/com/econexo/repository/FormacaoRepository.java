package com.econexo.repository;

import com.econexo.model.Formacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormacaoRepository extends JpaRepository<Formacao, Integer> {

    List<Formacao> findByUsuarioIdUsuario(Integer idUsuario);
}
