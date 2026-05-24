package com.econexo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Classe que representa a entidade Formacao (educação).
 * Mapeia a tabela FORMACAO do MER.
 */
@Entity
@Table(name = "formacao")
public class Formacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_formacao")
    private Integer idFormacao;

    @ManyToOne
    @JoinColumn(name = "fk_usuario")
    private Usuario usuario;

    @Column(length = 150)
    private String instituicao;

    @Column(length = 100)
    private String diploma;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    public Formacao() {
    }

    public Formacao(Integer idFormacao, Usuario usuario, String instituicao,
                    String diploma, LocalDate dataInicio, LocalDate dataFim) {
        this.idFormacao = idFormacao;
        this.usuario = usuario;
        this.instituicao = instituicao;
        this.diploma = diploma;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    public Integer getIdFormacao() {
        return idFormacao;
    }

    public void setIdFormacao(Integer idFormacao) {
        this.idFormacao = idFormacao;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getInstituicao() {
        return instituicao;
    }

    public void setInstituicao(String instituicao) {
        this.instituicao = instituicao;
    }

    public String getDiploma() {
        return diploma;
    }

    public void setDiploma(String diploma) {
        this.diploma = diploma;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    @Override
    public String toString() {
        return "Formacao{" +
                "idFormacao=" + idFormacao +
                ", instituicao='" + instituicao + '\'' +
                ", diploma='" + diploma + '\'' +
                ", dataInicio=" + dataInicio +
                ", dataFim=" + dataFim +
                '}';
    }
}
