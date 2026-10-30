package com.econexo.repository;

import com.econexo.model.AnaliseConta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnaliseContaRepository extends JpaRepository<AnaliseConta, Integer> {

    List<AnaliseConta> findByUsuarioIdUsuarioOrderByCriadaEmDesc(Integer idUsuario);

    /** Busca já filtrando pelo dono: id de análise alheia responde "não existe". */
    Optional<AnaliseConta> findByIdAnaliseAndUsuarioIdUsuario(Integer idAnalise, Integer idUsuario);
}
