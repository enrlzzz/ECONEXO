package model;

import java.time.LocalDate;

/**
 * Classe que representa a entidade Projeto.
 * Mapeia a tabela PROJETO do MER.
 */
public class Projeto {

    private Integer idProjeto;
    private Integer fkCriador;       // ID do usuário que publicou
    private String titulo;
    private String descricao;
    private String tipoProjeto;      // Portfólio ou Atual/Vaga
    private String status;           // Aberto/Em Andamento/Concluído
    private LocalDate dataInicio;
    private LocalDate dataFim;

    // Construtor vazio
    public Projeto() {
    }

    // Construtor completo
    public Projeto(Integer idProjeto, Integer fkCriador, String titulo, String descricao,
                   String tipoProjeto, String status, LocalDate dataInicio, LocalDate dataFim) {
        this.idProjeto = idProjeto;
        this.fkCriador = fkCriador;
        this.titulo = titulo;
        this.descricao = descricao;
        this.tipoProjeto = tipoProjeto;
        this.status = status;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    // Construtor para criação (sem ID, status default "Aberto")
    public Projeto(Integer fkCriador, String titulo, String descricao, String tipoProjeto) {
        this.fkCriador = fkCriador;
        this.titulo = titulo;
        this.descricao = descricao;
        this.tipoProjeto = tipoProjeto;
        this.status = "Aberto";
        this.dataInicio = LocalDate.now();
    }

    // --- Getters e Setters ---

    public Integer getIdProjeto() {
        return idProjeto;
    }

    public void setIdProjeto(Integer idProjeto) {
        this.idProjeto = idProjeto;
    }

    public Integer getFkCriador() {
        return fkCriador;
    }

    public void setFkCriador(Integer fkCriador) {
        this.fkCriador = fkCriador;
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
