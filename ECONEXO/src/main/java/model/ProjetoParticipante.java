package model;

/**
 * Classe associativa entre Projeto e Usuario (participantes).
 * Mapeia a tabela PROJETO_PARTICIPANTE do MER.
 */
public class ProjetoParticipante {

    private Integer fkProjeto;
    private Integer fkUsuario;
    private String papel;  // Colaborador ou Contratado

    // Construtor vazio
    public ProjetoParticipante() {
    }

    // Construtor completo
    public ProjetoParticipante(Integer fkProjeto, Integer fkUsuario, String papel) {
        this.fkProjeto = fkProjeto;
        this.fkUsuario = fkUsuario;
        this.papel = papel;
    }

    // --- Getters e Setters ---

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

    @Override
    public String toString() {
        return "ProjetoParticipante{" +
                "fkProjeto=" + fkProjeto +
                ", fkUsuario=" + fkUsuario +
                ", papel='" + papel + '\'' +
                '}';
    }
}
