package com.econexo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Classe que representa a entidade Projeto.
 * Mapeia a tabela PROJETO do MER.
 */
@Entity
@Table(name = "projeto")
public class Projeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_projeto")
    private Integer idProjeto;

    @ManyToOne
    @JoinColumn(name = "fk_criador")
    private Usuario criador;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "tipo_projeto", length = 50)
    private String tipoProjeto;

    @Column(length = 50)
    private String status;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    /** Onde a obra acontece — usado pela busca de projetos por região. */
    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String estado;

    /**
     * Potência em kWp. BigDecimal e não double: 13,2 kWp em ponto flutuante
     * binário vira 13.199999999999999, e isso aparece na tela do usuário.
     */
    @Column(name = "potencia_kwp", precision = 10, scale = 2)
    private java.math.BigDecimal potenciaKwp;

    public Projeto() {
    }

    public Projeto(Integer idProjeto, Usuario criador, String titulo, String descricao,
                   String tipoProjeto, String status, LocalDate dataInicio, LocalDate dataFim) {
        this.idProjeto = idProjeto;
        this.criador = criador;
        this.titulo = titulo;
        this.descricao = descricao;
        this.tipoProjeto = tipoProjeto;
        this.status = status;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    public Integer getIdProjeto() {
        return idProjeto;
    }

    public void setIdProjeto(Integer idProjeto) {
        this.idProjeto = idProjeto;
    }

    public Usuario getCriador() {
        return criador;
    }

    public void setCriador(Usuario criador) {
        this.criador = criador;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getTipoProjeto() {
        return tipoProjeto;
    }

    public void setTipoProjeto(String tipoProjeto) {
        this.tipoProjeto = tipoProjeto;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public java.math.BigDecimal getPotenciaKwp() {
        return potenciaKwp;
    }

    public void setPotenciaKwp(java.math.BigDecimal potenciaKwp) {
        this.potenciaKwp = potenciaKwp;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    @Override
    public String toString() {
        return "Projeto{" +
                "idProjeto=" + idProjeto +
                ", titulo='" + titulo + '\'' +
                ", tipoProjeto='" + tipoProjeto + '\'' +
                ", status='" + status + '\'' +
                ", dataInicio=" + dataInicio +
                ", dataFim=" + dataFim +
                '}';
    }
}
