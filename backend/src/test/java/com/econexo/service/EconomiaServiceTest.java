package com.econexo.service;

import com.econexo.dto.EconomiaResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Formato de ida e volta da API do Groq, sem rede: o pedido sai em JSON mode
 * com o modelo configurado, e a resposta de chat completions vira números
 * por mês para o painel.
 */
class EconomiaServiceTest {

    private final ObjectMapper json = new ObjectMapper();

    private EconomiaService servico() {
        EconomiaService s = new EconomiaService();
        ReflectionTestUtils.setField(s, "modelo", "openai/gpt-oss-120b");
        return s;
    }

    @Test
    @DisplayName("Groq - pedido usa o modelo configurado e JSON mode")
    void pedidoEmJsonMode() throws Exception {
        JsonNode corpo = json.readTree(servico().corpo("conta de teste"));
        assertThat(corpo.path("model").asText()).isEqualTo("openai/gpt-oss-120b");
        assertThat(corpo.path("response_format").path("type").asText()).isEqualTo("json_object");
        assertThat(corpo.path("messages").path(1).path("content").asText()).isEqualTo("conta de teste");
        // JSON mode do Groq exige a palavra JSON nas mensagens.
        assertThat(corpo.path("messages").toString()).contains("JSON");
    }

    @Test
    @DisplayName("Groq - resposta de chat completions vira resumo e números por mês")
    void respostaViraDadosEstruturados() throws Exception {
        String conteudo = json.writeValueAsString(json.createObjectNode()
                .put("resumo", "Subiu 10%")
                .put("analise", "## Resumo\n- Bandeira amarela.")
                .put("economiaSolarMensalReais", 210)
                .set("meses", json.readTree("""
                        [{"referencia":"07/2026","consumoKwh":300,"valorReais":250.1},
                         {"referencia":"08/2026","consumoKwh":null,"valorReais":275.4}]""")));
        String resposta = json.writeValueAsString(json.createObjectNode().set("choices",
                json.createArrayNode().add(json.createObjectNode().set("message",
                        json.createObjectNode().put("role", "assistant").put("content", conteudo)))));

        EconomiaService s = servico();
        EconomiaResponse r = s.interpretar(s.extrairTexto(resposta));

        assertThat(r.resumo()).isEqualTo("Subiu 10%");
        assertThat(r.meses()).hasSize(2);
        assertThat(r.meses().get(1).consumoKwh()).isNull();
        assertThat(r.economiaSolarMensal()).isEqualByComparingTo("210");
        assertThat(r.fonte()).contains("openai/gpt-oss-120b");
    }

    @Test
    @DisplayName("Groq - texto que não é JSON ainda chega como análise")
    void textoLivreNaoQuebra() {
        EconomiaResponse r = servico().interpretar("Não consegui ler os valores.");
        assertThat(r.analise()).isEqualTo("Não consegui ler os valores.");
        assertThat(r.meses()).isEmpty();
    }
}
