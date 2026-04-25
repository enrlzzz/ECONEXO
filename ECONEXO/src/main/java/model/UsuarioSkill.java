package model;

public class UsuarioSkill {
    
    private Integer fkUsuario;
    private Integer fkSkill;
    private String nivelProficiencia;  // Iniciante, Intermediário, Avançado, Expert
    
    // Relacionamentos
    private Usuario usuario;
    private Skill skill;
    
    // Construtores
    public UsuarioSkill() {}
    
    public UsuarioSkill(Integer fkUsuario, Integer fkSkill, String nivelProficiencia) {
        this.fkUsuario = fkUsuario;
        this.fkSkill = fkSkill;
        this.nivelProficiencia = nivelProficiencia;
    }
    
    // Getters e Setters
    public Integer getFkUsuario() {
        return fkUsuario;
    }
    
    public void setFkUsuario(Integer fkUsuario) {
        this.fkUsuario = fkUsuario;
    }
    
    public Integer getFkSkill() {
        return fkSkill;
    }
    
    public void setFkSkill(Integer fkSkill) {
        this.fkSkill = fkSkill;
    }
    
    public String getNivelProficiencia() {
        return nivelProficiencia;
    }
    
    public void setNivelProficiencia(String nivelProficiencia) {
        this.nivelProficiencia = nivelProficiencia;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public Skill getSkill() {
        return skill;
    }
    
    public void setSkill(Skill skill) {
        this.skill = skill;
    }
    
    @Override
    public String toString() {
        return "UsuarioSkill{" +
                "fkUsuario=" + fkUsuario +
                ", fkSkill=" + fkSkill +
                ", nivelProficiencia='" + nivelProficiencia + '\'' +
                '}';
    }
}
