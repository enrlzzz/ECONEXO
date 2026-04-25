package model;

public class Avaliacao {
    
    private Integer idAvaliacao;
    private Integer fkProjeto;
    private Integer fkAvaliador;  // ID do usuário que faz a avaliação
    private Integer fkAvaliado;   // ID do usuário que é avaliado
    private Integer estrelas;     // 1-5 stars
    private String comentario;
    
    // Relacionamentos
    private Projeto projeto;
    private Usuario avaliador;
    private Usuario avaliado;
    
    // Construtores
    public Avaliacao() {}
    
    public Avaliacao(Integer fkProjeto, Integer fkAvaliador, Integer fkAvaliado, Integer estrelas, String comentario) {
        this.fkProjeto = fkProjeto;
        this.fkAvaliador = fkAvaliador;
        this.fkAvaliado = fkAvaliado;
        this.estrelas = estrelas;
        this.comentario = comentario;
    }
    
    // Getters e Setters
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
        if (estrelas >= 1 && estrelas <= 5) {
            this.estrelas = estrelas;
        } else {
            throw new IllegalArgumentException("Estrelas deve estar entre 1 e 5");
        }
    }
    
    public String getComentario() {
        return comentario;
    }
    
    public void setComentario(String comentario) {
        this.comentario = comentario;
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
