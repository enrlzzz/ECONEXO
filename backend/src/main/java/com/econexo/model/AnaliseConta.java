package com.econexo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Uma análise de contas de energia guardada no histórico do usuário.
 *
 * Só o resultado fica salvo: o texto da IA e os números por mês. O texto
 * extraído das contas (nome, CPF, endereço do titular) nunca é gravado.
 */
@Entity
@Table(name = "analise_conta")
public class AnaliseConta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "id_analise") private Integer idAnalise;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "fk_usuario", nullable = false) private Usuario usuario;
    @Column(name = "criada_em", nullable = false) private LocalDateTime criadaEm = LocalDateTime.now();
    @Column(nullable = false, length = 200) private String resumo;
    @Column(nullable = false, columnDefinition = "TEXT") private String analise;
    @Column(name = "meses_json", columnDefinition = "TEXT") private String mesesJson;
    @Column(name = "consumo_medio_kwh", precision = 10, scale = 2) private BigDecimal consumoMedioKwh;
    @Column(name = "valor_medio", precision = 10, scale = 2) private BigDecimal valorMedio;
    @Column(name = "economia_solar_mensal", precision = 10, scale = 2) private BigDecimal economiaSolarMensal;
    public Integer getIdAnalise(){return idAnalise;} public Usuario getUsuario(){return usuario;} public void setUsuario(Usuario v){usuario=v;} public LocalDateTime getCriadaEm(){return criadaEm;} public String getResumo(){return resumo;} public void setResumo(String v){resumo=v;} public String getAnalise(){return analise;} public void setAnalise(String v){analise=v;} public String getMesesJson(){return mesesJson;} public void setMesesJson(String v){mesesJson=v;} public BigDecimal getConsumoMedioKwh(){return consumoMedioKwh;} public void setConsumoMedioKwh(BigDecimal v){consumoMedioKwh=v;} public BigDecimal getValorMedio(){return valorMedio;} public void setValorMedio(BigDecimal v){valorMedio=v;} public BigDecimal getEconomiaSolarMensal(){return economiaSolarMensal;} public void setEconomiaSolarMensal(BigDecimal v){economiaSolarMensal=v;}
}
