package com.econexo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Classe que representa a entidade Usuário.
 * Mapeia a tabela USUARIO do MER.
 */
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String senha;

    /**
     * Criptografado em repouso (AES-256-GCM) — no banco não existe CPF legível.
     * O converter cifra/decifra sozinho; aqui em Java o valor é o CPF normal.
     * A coluna precisa de 255 porque o cifrado em base64 é bem maior que 14.
     */
    @Convert(converter = com.econexo.security.CriptografiaConverter.class)
    @Column(unique = true, length = 255)
    private String cpf;

    @Column(length = 20)
    private String telefone;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    /**
     * Localização profissional. Não é dado sensível (não é endereço completo,
     * é a praça de atuação) e é o que a busca por região usa para filtrar.
     */
    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String estado;

    /**
     * O que a pessoa faz no setor: INSTALADOR, PROJETISTA, TECNICO ou
     * NAO_INFORMADO. Existe porque a busca precisa distinguir quem instala de
     * quem assina projeto — sem isso, "buscar instalador" devolve todo mundo.
     *
     * Guardado como String (e não enum do JPA) para que um valor novo no
     * futuro não quebre a leitura das linhas já gravadas.
     */
    @Column(name = "tipo_profissional", length = 20)
    private String tipoProfissional;

    /**
     * Consentimento LGPD.
     *
     * A LGPD (Art. 8º, §2º) coloca o ônus da prova do consentimento no
     * controlador — ou seja, em nós. Guardar só um "true" não prova nada:
     * é preciso saber QUANDO foi dado e para QUAL versão da política, senão
     * uma mudança de texto invalida a prova de todos os consentimentos.
     */
    @Column(name = "consentimento_lgpd", nullable = false)
    private Boolean consentimentoLgpd = false;

    @Column(name = "consentimento_em")
    private LocalDateTime consentimentoEm;

    @Column(name = "consentimento_versao", length = 20)
    private String consentimentoVersao;

    public Usuario() {
    }

    public Usuario(Integer idUsuario, String nome, String email, String senha, 
                   String cpf, String telefone, LocalDate dataNascimento) {
        this.idUsuario = idUsuario;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.cpf = cpf;
        this.telefone = telefone;
        this.dataNascimento = dataNascimento;
    }

    public Usuario(String nome, String email, String senha, String cpf, 
                   String telefone, LocalDate dataNascimento) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.cpf = cpf;
        this.telefone = telefone;
        this.dataNascimento = dataNascimento;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Rede de segurança: a API responde só com DTOs, mas se algum dia alguém
     * devolver a entidade por engano, o hash da senha não vai junto no JSON.
     */
    @JsonIgnore
    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    @JsonIgnore
    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getTipoProfissional() {
        return tipoProfissional;
    }

    public void setTipoProfissional(String tipoProfissional) {
        this.tipoProfissional = tipoProfissional;
    }

    @JsonIgnore
    public Boolean getConsentimentoLgpd() {
        return consentimentoLgpd;
    }

    public void setConsentimentoLgpd(Boolean consentimentoLgpd) {
        this.consentimentoLgpd = consentimentoLgpd;
    }

    @JsonIgnore
    public LocalDateTime getConsentimentoEm() {
        return consentimentoEm;
    }

    public void setConsentimentoEm(LocalDateTime consentimentoEm) {
        this.consentimentoEm = consentimentoEm;
    }

    @JsonIgnore
    public String getConsentimentoVersao() {
        return consentimentoVersao;
    }

    public void setConsentimentoVersao(String consentimentoVersao) {
        this.consentimentoVersao = consentimentoVersao;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "idUsuario=" + idUsuario +
                ", nome='" + nome + '\'' +
                ", email='" + email + '\'' +
                ", cpf='" + cpf + '\'' +
                ", telefone='" + telefone + '\'' +
                ", dataNascimento=" + dataNascimento +
                '}';
    }
}
