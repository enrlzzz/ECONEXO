package com.econexo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Curtida de um usuário em um post.
 *
 * Uma linha por (post, usuário), com UNIQUE no banco: o contador de likes é
 * derivado de COUNT(*), nunca de um inteiro incrementado. Um contador em
 * coluna desanda ao primeiro clique duplo ou requisição repetida; a linha
 * única não tem como desandar.
 */
@Entity
@Table(name = "post_curtida",
       uniqueConstraints = @UniqueConstraint(columnNames = {"fk_post", "fk_usuario"}))
public class PostCurtida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_curtida")
    private Integer idCurtida;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_post", nullable = false)
    private Post post;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Integer getIdCurtida() {
        return idCurtida;
    }

    public void setIdCurtida(Integer idCurtida) {
        this.idCurtida = idCurtida;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
