package model;

import java.time.LocalDate;

/**
 * Classe que representa a entidade Formacao (educação).
 * Mapeia a tabela FORMACAO do MER.
 */
public class Formacao {

    private Integer idFormacao;
    private Integer fkUsuario;
    private String instituicao;
    private String diploma;
    private LocalDate dataInicio;
    private LocalDate dataFim;

    // Construtor vazio
    public Formacao() {
    }

    // Construtor completo
    public Formacao(Integer idFormacao, Integer fkUsuario, String instituicao,
                    String diploma, LocalDate dataInicio, LocalDate dataFim) {
        this.idFormacao = idFormacao;
        this.fkUsuario = fkUsuario;
        this.instituicao = instituicao;
        this.diploma = diploma;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    // Construtor sem ID
    public Formacao(Integer fkUsuario, String instituicao, String diploma,
                    LocalDate dataInicio, LocalDate dataFim) {
        this.fkUsuario = fkUsuario;
        this.instituicao = instituicao;
        this.diploma = diploma;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }

    // --- Getters e Setters ---

    public Integer getIdFormacao() {
        return idFormacao;
    }

    public void setIdFormacao(Integer idFormacao) {
        this.idFormacao = idFormacao;
    }

    public Integer getFkUsuario() {
        return fkUsuario;
    }

    public void setFkUsuario(Integer fkUsuario) {
        this.fkUsuario = fkUsuario;
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
                ", fkUsuario=" + fkUsuario +
                ", instituicao='" + instituicao + '\'' +
                ", diploma='" + diploma + '\'' +
                ", dataInicio=" + dataInicio +
                ", dataFim=" + dataFim +
                '}';
    }
}
