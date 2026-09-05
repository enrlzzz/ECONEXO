package com.econexo.repository;

import com.econexo.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnderecoRepository extends JpaRepository<Endereco, Integer> {

    /** Endereço é dado privado: sempre filtrado pelo dono, nunca findAll(). */
    List<Endereco> findByUsuarioIdUsuario(Integer idUsuario);
}
