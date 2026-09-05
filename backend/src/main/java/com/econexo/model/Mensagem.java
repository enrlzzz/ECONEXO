package com.econexo.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Mensagem direta entre dois usuários reais.
 *
 * Não existe "conversa" como tabela: a conversa é derivada do par
 * (remetente, destinatário) na consulta. Uma tabela de conversa só faria
 * sentido com grupos, que não existem aqui — e traria o problema clássico de
 * duas conversas paralelas entre as mesmas duas pessoas.
 */
@Entity
@Table(name = "mensagem")
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensagem")
    private Integer idMensagem;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_remetente", nullable = false)
    private Usuario remetente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "fk_destinatario", nullable = false)
    private Usuario destinatario;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texto;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    /** Nulo enquanto o destinatário não abriu a conversa. */
    @Column(name = "lida_em")
    private LocalDateTime lidaEm;

    public Integer getIdMensagem() {
        return idMensagem;
    }

    public void setIdMensagem(Integer idMensagem) {
        this.idMensagem = idMensagem;
    }

    public Usuario getRemetente() {
        return remetente;
    }

    public void setRemetente(Usuario remetente) {
        this.remetente = remetente;
    }

    public Usuario getDestinatario() {
        return destinatario;
    }

    public void setDestinatario(Usuario destinatario) {
        this.destinatario = destinatario;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getLidaEm() {
        return lidaEm;
    }

    public void setLidaEm(LocalDateTime lidaEm) {
        this.lidaEm = lidaEm;
    }
}
