package com.econexo.model;

import jakarta.persistence.*;

/**
 * Classe que representa a entidade Avaliacao.
 * Mapeia a tabela AVALIACAO do MER.
 */
@Entity
@Table(name = "avaliacao")
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_avaliacao")
    private Integer idAvaliacao;

    @ManyToOne
    @JoinColumn(name = "fk_projeto")
    private Projeto projeto;

    @ManyToOne
    @JoinColumn(name = "fk_avaliador")
    private Usuario avaliador;

    @ManyToOne
    @JoinColumn(name = "fk_avaliado")
    private Usuario avaliado;

    @Column(nullable = false)
    private Integer estrelas;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    public Avaliacao() {
    }

    public Avaliacao(Integer idAvaliacao, Projeto projeto, Usuario avaliador,
                     Usuario avaliado, Integer estrelas, String comentario) {
        this.idAvaliacao = idAvaliacao;
        this.projeto = projeto;
        this.avaliador = avaliador;
        this.avaliado = avaliado;
        setEstrelas(estrelas);
        this.comentario = comentario;
    }

    public Integer getIdAvaliacao() {
        return idAvaliacao;
    }

    public void setIdAvaliacao(Integer idAvaliacao) {
        this.idAvaliacao = idAvaliacao;
    }

    public Projeto getProjeto() {
        return projeto;
    }

    public void setProjeto(Projeto projeto) {
        this.projeto = projeto;
    }

    public Usuario getAvaliador() {
        return avaliador;
    }

    public void setAvaliador(Usuario avaliador) {
        this.avaliador = avaliador;
    }

    public Usuario getAvaliado() {
        return avaliado;
    }

    public void setAvaliado(Usuario avaliado) {
        this.avaliado = avaliado;
    }

    public Integer getEstrelas() {
        return estrelas;
    }

    public void setEstrelas(Integer estrelas) {
        if (estrelas != null && (estrelas < 1 || estrelas > 5)) {
            throw new IllegalArgumentException("Estrelas deve estar entre 1 e 5");
        }
        this.estrelas = estrelas;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    @Override
    public String toString() {
        return "Avaliacao{" +
                "idAvaliacao=" + idAvaliacao +
                ", estrelas=" + estrelas +
                ", comentario='" + comentario + '\'' +
                '}';
    }
}
