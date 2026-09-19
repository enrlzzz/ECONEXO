package com.econexo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacao")
public class Notificacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_notificacao") private Integer idNotificacao;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fk_usuario", nullable = false) private Usuario usuario;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fk_ator") private Usuario ator;
    @Column(nullable = false, length = 30) private String tipo;
    @Column(nullable = false, length = 255) private String texto;
    @Column(name = "referencia_id") private Integer referenciaId;
    @Column(name = "criado_em", nullable = false) private LocalDateTime criadoEm = LocalDateTime.now();
    @Column(nullable = false) private boolean lida;
    public Integer getIdNotificacao(){return idNotificacao;} public Usuario getUsuario(){return usuario;} public void setUsuario(Usuario v){usuario=v;} public Usuario getAtor(){return ator;} public void setAtor(Usuario v){ator=v;} public String getTipo(){return tipo;} public void setTipo(String v){tipo=v;} public String getTexto(){return texto;} public void setTexto(String v){texto=v;} public Integer getReferenciaId(){return referenciaId;} public void setReferenciaId(Integer v){referenciaId=v;} public LocalDateTime getCriadoEm(){return criadoEm;} public boolean isLida(){return lida;} public void setLida(boolean v){lida=v;}
}
