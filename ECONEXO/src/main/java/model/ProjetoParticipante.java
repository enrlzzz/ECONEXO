package model;

public class ProjetoParticipante {
    
    private Integer fkProjeto;
    private Integer fkUsuario;
    private String papel;  // Colaborador ou Contratado
    
    // Relacionamentos
    private Projeto projeto;
    private Usuario usuario;
    
    // Construtores
    public ProjetoParticipante() {}
    
    public ProjetoParticipante(Integer fkProjeto, Integer fkUsuario, String papel) {
        this.fkProjeto = fkProjeto;
        this.fkUsuario = fkUsuario;
        this.papel = papel;
    }
    
    // Getters e Setters
    public Integer getFkProjeto() {
        return fkProjeto;
    }
    
    public void setFkProjeto(Integer fkProjeto) {
        this.fkProjeto = fkProjeto;
    }
    
    public Integer getFkUsuario() {
        return fkUsuario;
    }
    
    public void setFkUsuario(Integer fkUsuario) {
        this.fkUsuario = fkUsuario;
    }
    
    public String getPapel() {
        return papel;
    }
    
    public void setPapel(String papel) {
        this.papel = papel;
    }
    
    public Projeto getProjeto() {
        return projeto;
    }
    
    public void setProjeto(Projeto projeto) {
        this.projeto = projeto;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    @Override
    public String toString() {
        return "ProjetoParticipante{" +
                "fkProjeto=" + fkProjeto +
                ", fkUsuario=" + fkUsuario +
                ", papel='" + papel + '\'' +
                '}';
    }
}
