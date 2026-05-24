package com.econexo.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * Classe associativa entre Projeto e Usuario (participantes).
 * Mapeia a tabela PROJETO_PARTICIPANTE do MER.
 */
@Entity
@Table(name = "projeto_participante")
public class ProjetoParticipante {

    @EmbeddedId
    private ProjetoParticipanteId id = new ProjetoParticipanteId();

    @ManyToOne
    @MapsId("fkProjeto")
    @JoinColumn(name = "fk_projeto")
    private Projeto projeto;

    @ManyToOne
    @MapsId("fkUsuario")
    @JoinColumn(name = "fk_usuario")
    private Usuario usuario;

    @Column(length = 50)
    private String papel;

    public ProjetoParticipante() {
    }

    public ProjetoParticipante(Projeto projeto, Usuario usuario, String papel) {
        this.projeto = projeto;
        this.usuario = usuario;
        this.papel = papel;
        this.id.fkProjeto = projeto.getIdProjeto();
        this.id.fkUsuario = usuario.getIdUsuario();
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

    public String getPapel() {
        return papel;
    }

    public void setPapel(String papel) {
        this.papel = papel;
    }

    @Embeddable
    public static class ProjetoParticipanteId implements Serializable {
        private Integer fkProjeto;
        private Integer fkUsuario;

        public ProjetoParticipanteId() {}

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ProjetoParticipanteId that = (ProjetoParticipanteId) o;
            return Objects.equals(fkProjeto, that.fkProjeto) && Objects.equals(fkUsuario, that.fkUsuario);
        }

        @Override
        public int hashCode() {
            return Objects.hash(fkProjeto, fkUsuario);
        }
    }
}
