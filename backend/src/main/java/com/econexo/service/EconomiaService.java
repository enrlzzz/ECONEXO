package com.econexo.service;

import com.econexo.dto.EconomiaRequest;
import com.econexo.dto.EconomiaResponse;
import com.econexo.dto.MesConta;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class EconomiaService {

    private static final Logger log = LoggerFactory.getLogger(EconomiaService.class);

    /**
     * Groq — API compatível com a da OpenAI (chat completions).
     * Chave em https://console.groq.com/keys → variável GROQ_API_KEY.
     */
    private static final String ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

    /**
     * Teto de caracteres por conta enviada ao modelo.
     *
     * Uma conta da CPFL em texto dá ~4 kB. O corte existe para um PDF
     * inesperado de 200 páginas não virar um prompt gigante — e uma fatura
     * de custo proporcional.
     */
    private static final int LIMITE_POR_CONTA = 12_000;

    @Value("${econexo.groq.api-key:}")
    private String apiKey;

    /**
     * Modelo do plano gratuito do Groq. Configurável (GROQ_MODEL) porque o
     * Groq aposenta modelos com alguma frequência: quando isso acontecer,
     * troca-se a variável no Render, sem novo deploy de código. Lista atual:
     * https://console.groq.com/docs/models
     */
    @Value("${econexo.groq.model:openai/gpt-oss-120b}")
    private String modelo;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    public EconomiaResponse analisar(EconomiaRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return EconomiaResponse.soTexto(
                    "Análise indisponível: configure GROQ_API_KEY no ambiente do backend.",
                    "configuração");
        }

        try {
            // A chave vai no header, não na query string: URL aparece em log de
            // proxy e em mensagem de erro de cliente HTTP, header não.
            HttpRequest req = HttpRequest.newBuilder(URI.create(ENDPOINT))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(60))
                    .POST(HttpRequest.BodyPublishers.ofString(corpo(montarPrompt(request.contas()))))
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 429) {
                // Plano gratuito: limite por minuto/dia do Groq estourado.
                log.warn("Groq recusou por limite de uso (429)");
                return EconomiaResponse.soTexto(
                        "Muitas análises ao mesmo tempo. Aguarde um minuto e tente de novo.",
                        "groq");
            }

            if (response.statusCode() >= 400) {
                // O corpo da resposta pode citar trechos do prompt, que aqui é
                // a conta de luz do usuário. Vai só o status no log.
                log.warn("Groq respondeu {} ao analisar contas", response.statusCode());
                return EconomiaResponse.soTexto(
                        "Não foi possível analisar as contas agora. Tente de novo em alguns minutos.",
                        "groq");
            }

            return interpretar(extrairTexto(response.body()));

        } catch (Exception ex) {
            log.warn("Falha ao chamar o Groq: {}", ex.getClass().getSimpleName());
            return EconomiaResponse.soTexto(
                    "Não foi possível analisar as contas agora. Tente de novo em alguns minutos.",
                    "groq");
        }
    }

    private String montarPrompt(List<String> contas) {
        StringBuilder sb = new StringBuilder();

        sb.append("Você analisa contas de energia elétrica da CPFL para um cliente no Brasil.\n")
          .append("Recebeu ").append(contas.size()).append(" contas de meses diferentes do mesmo titular.\n\n")
          .append("Responda SOMENTE com um objeto JSON com os campos:\n")
          .append("- \"resumo\": uma frase de até 120 caracteres com a principal conclusão\n")
          .append("  (ex.: \"Subiu 18%: bandeira vermelha e mais consumo\").\n")
          .append("- \"meses\": uma entrada por conta, na ordem recebida, com \"referencia\" (MM/AAAA),\n")
          .append("  \"consumoKwh\" e \"valorReais\" (números; null se não aparecer na conta).\n")
          .append("- \"economiaSolarMensalReais\": estimativa em R$ por mês, ou null.\n")
          .append("- \"analise\": o texto para o cliente, em português do Brasil, com subtítulos curtos,\n")
          .append("  cobrindo:\n")
          .append("1. Consumo em kWh e valor pago em cada mês, na ordem em que aparecem.\n")
          .append("2. O que mudou entre os meses e a causa mais provável — separe o que é aumento de\n")
          .append("   consumo do que é bandeira tarifária, reajuste, imposto ou taxa de iluminação.\n")
          .append("3. Estimativa de economia com geração solar, em R$ por mês e em percentual,\n")
          .append("   partindo da média de consumo observada.\n")
          .append("4. Três ações práticas, em ordem de impacto.\n\n")
          .append("Formatação do campo analise: use '## ' só para subtítulos, '- ' para listas e **negrito** para\n")
          .append("destacar valores. Não use tabelas, blocos de código nem links.\n\n")
          .append("Regras: não invente nenhum número que não esteja nas contas. Se um dado não\n")
          .append("aparecer, diga explicitamente que não foi encontrado. Não repita nome, CPF nem\n")
          .append("endereço do titular na resposta.\n");

        for (int i = 0; i < contas.size(); i++) {
            String conta = contas.get(i);
            if (conta.length() > LIMITE_POR_CONTA) {
                conta = conta.substring(0, LIMITE_POR_CONTA);
            }
            sb.append("\n===== CONTA ").append(i + 1).append(" =====\n").append(conta).append('\n');
        }

        return sb.toString();
    }

    /**
     * Monta o JSON com Jackson.
     *
     * Antes era concatenação de String com escape feito à mão. Uma conta
     * com aspas, barra invertida ou acento fora do previsto gerava JSON
     * inválido e a análise falhava sem explicação.
     */
    String corpo(String prompt) throws Exception {
        ObjectNode raiz = mapper.createObjectNode();
        raiz.put("model", modelo);
        raiz.put("temperature", 0.2);
        raiz.put("max_completion_tokens", 4096);
        // JSON mode: o modelo é obrigado a devolver um objeto JSON válido. Os
        // números alimentam o painel do perfil; extrair valor de texto livre
        // com regex seria frágil. (O formato dos campos está no prompt — o
        // JSON mode exige a palavra "JSON" nas mensagens.)
        raiz.putObject("response_format").put("type", "json_object");
        ArrayNode mensagens = raiz.putArray("messages");
        mensagens.addObject()
                .put("role", "system")
                .put("content", "Você é um analista de contas de energia elétrica no Brasil. "
                        + "Responda sempre com um único objeto JSON, em português do Brasil.");
        mensagens.addObject().put("role", "user").put("content", prompt);
        return mapper.writeValueAsString(raiz);
    }

    /** Lê choices[0].message.content da resposta de chat completions. */
    String extrairTexto(String json) throws Exception {
        String texto = mapper.readTree(json)
                .path("choices").path(0)
                .path("message").path("content")
                .asText("").trim();
        return texto.isEmpty()
                ? "O modelo não devolveu uma análise para estas contas."
                : texto;
    }

    /**
     * Lê o JSON que o modelo devolveu. Se por algum motivo não vier JSON, o
     * texto inteiro vira a análise e o resto fica vazio — o cliente ainda
     * recebe a explicação, só sem números para o painel.
     */
    EconomiaResponse interpretar(String texto) {
        try {
            JsonNode raiz = mapper.readTree(texto);
            String analise = raiz.path("analise").asText("").trim();
            String resumo = raiz.path("resumo").asText("").trim();
            if (analise.isEmpty()) {
                throw new IllegalArgumentException("sem análise");
            }
            List<MesConta> meses = new ArrayList<>();
            raiz.path("meses").forEach(m -> meses.add(new MesConta(
                    textoOuNulo(m.path("referencia")),
                    numeroOuNulo(m.path("consumoKwh")),
                    numeroOuNulo(m.path("valorReais")))));
            return new EconomiaResponse(analise, "Groq · " + modelo,
                    resumo.isEmpty() ? "Análise de " + meses.size() + " contas" : resumo,
                    meses, numeroOuNulo(raiz.path("economiaSolarMensalReais")), null);
        } catch (Exception e) {
            return new EconomiaResponse(texto, "Groq · " + modelo, "Análise de contas de energia",
                    List.of(), null, null);
        }
    }

    private static String textoOuNulo(JsonNode n) {
        return n.isTextual() && !n.asText().isBlank() ? n.asText().trim() : null;
    }

    private static BigDecimal numeroOuNulo(JsonNode n) {
        return n.isNumber() ? n.decimalValue() : null;
    }
}
