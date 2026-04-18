package model;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Classe que representa a entidade Usuário.
 * Ajustada para alinhar com o MER (id, nome, email, senha, cpf, telefone, data_nascimento).
 */
public class Usuario {

    private Long id;
    private String nome;
    private String email;
    private String senha;
    private String cpf;
    private String telefone;
    private LocalDate dataNascimento; // Uso de LocalDate para representar 'date' do SQL
    private LocalDateTime dataCriacao;
    private boolean ativo;

    public Usuario() {
    }

    // Construtor completo ajustado: Agora inclui todos os campos do diagrama
    public Usuario(Long id, String nome, String email, String senha, String cpf, String telefone, LocalDate dataNascimento) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.cpf = cpf;
        this.telefone = telefone;
        this.dataNascimento = dataNascimento;
        this.dataCriacao = LocalDateTime.now();
        this.ativo = true;
    }

    // --- Getters e Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf; // Faltava o Getter do CPF
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTelefone() {
        return telefone; // Faltava o Getter do Telefone
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    // Corrigido: O parâmetro deve ser do mesmo tipo do atributo (LocalDate)
    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
    
    // Para atributos booleanos, o padrão Java Bean usa "is" em vez de "get"
    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", email='" + email + '\'' +
                ", cpf='" + cpf + '\'' +
                ", ativo=" + ativo +
                '}';
    }
}