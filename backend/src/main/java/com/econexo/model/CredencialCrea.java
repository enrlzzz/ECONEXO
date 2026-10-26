package com.econexo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Registro CREA que um profissional diz ter, e o que já foi conferido sobre ele.
 *
 * O profissional só PEDE a verificação (status PENDENTE). Quem muda o status é
 * um administrador, depois de conferir nome e registro na consulta pública do
 * conselho — não existe consulta automática confiável (ver ValidacaoService).
 */
@Entity
@Table(name = "credencial_crea")
public class CredencialCrea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_credencial")
    private Integer idCredencial;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false, length = 20)
    private String registro;

    @Column(nullable = false, length = 2)
    private String uf;

    /** Nome como o profissional informou que consta no registro. */
    @Column(name = "nome_registro", nullable = false, length = 100)
    private String nomeRegistro;

    /** PENDENTE, VERIFICADA ou REJEITADA. String, não enum: ver NotificacaoService. */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 255)
    private String observacao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(name = "avaliado_em")
    private LocalDateTime avaliadoEm;

    /** Id do administrador que decidiu. Sem FK de propósito: apagar o admin não apaga o histórico. */
    @Column(name = "avaliado_por")
    private Integer avaliadoPor;

    public Integer getIdCredencial() { return idCredencial; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getRegistro() { return registro; }
    public void setRegistro(String registro) { this.registro = registro; }

    public String getUf() { return uf; }
    public void setUf(String uf) { this.uf = uf; }

    public String getNomeRegistro() { return nomeRegistro; }
    public void setNomeRegistro(String nomeRegistro) { this.nomeRegistro = nomeRegistro; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public LocalDateTime getAvaliadoEm() { return avaliadoEm; }
    public void setAvaliadoEm(LocalDateTime avaliadoEm) { this.avaliadoEm = avaliadoEm; }

    public Integer getAvaliadoPor() { return avaliadoPor; }
    public void setAvaliadoPor(Integer avaliadoPor) { this.avaliadoPor = avaliadoPor; }
}
