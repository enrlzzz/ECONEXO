package model;

/**
 * Classe associativa entre Usuario e Skill.
 * Mapeia a tabela USUARIO_SKILL do MER (relação N:N com atributo extra).
 */
public class UsuarioSkill {

    private Integer fkUsuario;
    private Integer fkSkill;
    private String nivelProficiencia;  // Iniciante, Intermediário, Avançado, Expert

    // Construtor vazio
    public UsuarioSkill() {
    }

    // Construtor completo
    public UsuarioSkill(Integer fkUsuario, Integer fkSkill, String nivelProficiencia) {
        this.fkUsuario = fkUsuario;
        this.fkSkill = fkSkill;
        this.nivelProficiencia = nivelProficiencia;
    }

    // --- Getters e Setters ---

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

    @Override
    public String toString() {
        return "UsuarioSkill{" +
                "fkUsuario=" + fkUsuario +
                ", fkSkill=" + fkSkill +
                ", nivelProficiencia='" + nivelProficiencia + '\'' +
                '}';
    }
}
