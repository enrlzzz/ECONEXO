package com.econexo.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * Classe associativa entre Usuario e Skill.
 * Mapeia a tabela USUARIO_SKILL do MER.
 */
@Entity
@Table(name = "usuario_skill")
public class UsuarioSkill {

    @EmbeddedId
    private UsuarioSkillId id = new UsuarioSkillId();

    @ManyToOne
    @MapsId("fkUsuario")
    @JoinColumn(name = "fk_usuario")
    private Usuario usuario;

    @ManyToOne
    @MapsId("fkSkill")
    @JoinColumn(name = "fk_skill")
    private Skill skill;

    @Column(name = "nivel_proficiencia", length = 50)
    private String nivelProficiencia;

    public UsuarioSkill() {
    }

    public UsuarioSkill(Usuario usuario, Skill skill, String nivelProficiencia) {
        this.usuario = usuario;
        this.skill = skill;
        this.nivelProficiencia = nivelProficiencia;
        this.id.fkUsuario = usuario.getIdUsuario();
        this.id.fkSkill = skill.getIdSkill();
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

    public String getNivelProficiencia() {
        return nivelProficiencia;
    }

    public void setNivelProficiencia(String nivelProficiencia) {
        this.nivelProficiencia = nivelProficiencia;
    }

    @Embeddable
    public static class UsuarioSkillId implements Serializable {
        private Integer fkUsuario;
        private Integer fkSkill;

        public UsuarioSkillId() {}

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            UsuarioSkillId that = (UsuarioSkillId) o;
            return Objects.equals(fkUsuario, that.fkUsuario) && Objects.equals(fkSkill, that.fkSkill);
        }

        @Override
        public int hashCode() {
            return Objects.hash(fkUsuario, fkSkill);
        }
    }
}
