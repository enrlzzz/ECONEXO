package model;

/**
 * Classe que representa a entidade Avaliacao.
 * Mapeia a tabela AVALIACAO do MER.
 */
public class Avaliacao {

    private Integer idAvaliacao;
    private Integer fkProjeto;
    private Integer fkAvaliador;   // ID do usuário que faz a avaliação
    private Integer fkAvaliado;    // ID do usuário que é avaliado
    private Integer estrelas;      // 1-5 estrelas
    private String comentario;

    // Construtor vazio
    public Avaliacao() {
    }

    // Construtor completo
    public Avaliacao(Integer idAvaliacao, Integer fkProjeto, Integer fkAvaliador,
                     Integer fkAvaliado, Integer estrelas, String comentario) {
        this.idAvaliacao = idAvaliacao;
        this.fkProjeto = fkProjeto;
        this.fkAvaliador = fkAvaliador;
        this.fkAvaliado = fkAvaliado;
        setEstrelas(estrelas);  // Usa setter para validação
        this.comentario = comentario;
    }

    // Construtor sem ID
    public Avaliacao(Integer fkProjeto, Integer fkAvaliador, Integer fkAvaliado,
                     Integer estrelas, String comentario) {
        this.fkProjeto = fkProjeto;
        this.fkAvaliador = fkAvaliador;
        this.fkAvaliado = fkAvaliado;
        setEstrelas(estrelas);
        this.comentario = comentario;
    }

    // --- Getters e Setters ---

    public Integer getIdAvaliacao() {
        return idAvaliacao;
    }

    public void setIdAvaliacao(Integer idAvaliacao) {
        this.idAvaliacao = idAvaliacao;
    }

    public Integer getFkProjeto() {
        return fkProjeto;
    }

    public void setFkProjeto(Integer fkProjeto) {
        this.fkProjeto = fkProjeto;
    }

    public Integer getFkAvaliador() {
        return fkAvaliador;
    }

    public void setFkAvaliador(Integer fkAvaliador) {
        this.fkAvaliador = fkAvaliador;
    }

    public Integer getFkAvaliado() {
        return fkAvaliado;
    }

    public void setFkAvaliado(Integer fkAvaliado) {
        this.fkAvaliado = fkAvaliado;
    }

    public Integer getEstrelas() {
        return estrelas;
    }

    public void setEstrelas(Integer estrelas) {
        if (estrelas == null || estrelas < 1 || estrelas > 5) {
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
                ", fkProjeto=" + fkProjeto +
                ", fkAvaliador=" + fkAvaliador +
                ", fkAvaliado=" + fkAvaliado +
                ", estrelas=" + estrelas +
                ", comentario='" + comentario + '\'' +
                '}';
    }
}
