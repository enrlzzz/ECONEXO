package com.econexo.model;

import jakarta.persistence.*;

/**
 * Classe que representa a entidade Skill (habilidade).
 * Mapeia a tabela SKILL do MER.
 */
@Entity
@Table(name = "skill")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_skill")
    private Integer idSkill;

    @Column(name = "nome_skill", nullable = false, length = 100)
    private String nomeSkill;

    @Column(length = 100)
    private String categoria;

    public Skill() {
    }

    public Skill(Integer idSkill, String nomeSkill, String categoria) {
        this.idSkill = idSkill;
        this.nomeSkill = nomeSkill;
        this.categoria = categoria;
    }

    public Skill(String nomeSkill, String categoria) {
        this.nomeSkill = nomeSkill;
        this.categoria = categoria;
    }

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
