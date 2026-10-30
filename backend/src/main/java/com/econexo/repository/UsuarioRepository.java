package com.econexo.repository;

import com.econexo.model.Usuario;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByFirebaseUid(String firebaseUid);

    /**
     * Busca de profissionais feita NO BANCO.
     *
     * Antes o service fazia findAll() e filtrava em memória: a cada busca
     * (e a busca dispara a cada tecla digitada) a base inteira atravessava a
     * internet até o Render, com o CPF de todo mundo sendo decifrado à toa.
     *
     * Filtro vazio chega como "" (não null) e é ignorado — assim o tipo do
     * parâmetro nunca é ambíguo para o banco. nome e cidade chegam em
     * minúsculas; estado e tipo, em maiúsculas.
     */
    @Query("""
           SELECT u FROM Usuario u
           WHERE u.idUsuario <> :idExcluido
             AND (:nome = '' OR LOWER(u.nome) LIKE CONCAT('%', :nome, '%'))
             AND (:cidade = '' OR LOWER(u.cidade) LIKE CONCAT('%', :cidade, '%'))
             AND (:estado = '' OR u.estado = :estado)
             AND (:tipo = '' OR u.tipoProfissional = :tipo)
           ORDER BY u.nome ASC
           """)
    List<Usuario> buscar(@Param("idExcluido") Integer idExcluido,
                         @Param("nome") String nome,
                         @Param("cidade") String cidade,
                         @Param("estado") String estado,
                         @Param("tipo") String tipo,
                         Pageable pagina);
}
