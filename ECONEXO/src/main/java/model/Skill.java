package model;

/**
 * Classe que representa a entidade Skill (habilidade).
 * Mapeia a tabela SKILL do MER.
 */
public class Skill {

    private Integer idSkill;
    private String nomeSkill;
    private String categoria;

    // Construtor vazio
    public Skill() {
    }

    // Construtor completo
    public Skill(Integer idSkill, String nomeSkill, String categoria) {
        this.idSkill = idSkill;
        this.nomeSkill = nomeSkill;
        this.categoria = categoria;
    }

    // Construtor sem ID
    public Skill(String nomeSkill, String categoria) {
        this.nomeSkill = nomeSkill;
        this.categoria = categoria;
    }

    // --- Getters e Setters ---

    public Integer getIdSkill() {
        return idSkill;
    }

    public void setIdSkill(Integer idSkill) {
        this.idSkill = idSkill;
    }

    public String getNomeSkill() {
        return nomeSkill;
    }

    public void setNomeSkill(String nomeSkill) {
        this.nomeSkill = nomeSkill;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    @Override
    public String toString() {
        return "Skill{" +
                "idSkill=" + idSkill +
                ", nomeSkill='" + nomeSkill + '\'' +
                ", categoria='" + categoria + '\'' +
                '}';
    }
}
