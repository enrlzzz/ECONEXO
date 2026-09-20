package com.econexo.service;

import com.econexo.dto.EconomiaRequest;
import com.econexo.dto.EconomiaResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;

@Service
public class EconomiaService {

    private static final Logger log = LoggerFactory.getLogger(EconomiaService.class);

    private static final String ENDPOINT =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    /**
     * Teto de caracteres por conta enviada ao modelo.
     *
     * Uma conta da CPFL em texto dá ~4 kB. O corte existe para um PDF
     * inesperado de 200 páginas não virar um prompt gigante — e uma fatura
     * de custo proporcional.
     */
    private static final int LIMITE_POR_CONTA = 12_000;

    @Value("${econexo.gemini.api-key:}")
    private String apiKey;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    public EconomiaResponse analisar(EconomiaRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return new EconomiaResponse(
                    "Análise indisponível: configure GEMINI_API_KEY no ambiente do backend.",
                    "configuração");
        }

        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(ENDPOINT + "?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(60))
                    .POST(HttpRequest.BodyPublishers.ofString(corpo(montarPrompt(request.contas()))))
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                // O corpo da resposta do Gemini pode citar trechos do prompt,
                // que aqui é a conta de luz do usuário. Vai só o status no log.
                log.warn("Gemini respondeu {} ao analisar contas", response.statusCode());
                return new EconomiaResponse(
                        "Não foi possível analisar as contas agora. Tente de novo em alguns minutos.",
                        "gemini");
            }

            return new EconomiaResponse(extrairTexto(response.body()), "Gemini 2.5 Flash");

        } catch (Exception ex) {
            log.warn("Falha ao chamar o Gemini: {}", ex.getClass().getSimpleName());
            return new EconomiaResponse(
                    "Não foi possível analisar as contas agora. Tente de novo em alguns minutos.",
                    "gemini");
        }
    }

    private String montarPrompt(List<String> contas) {
        StringBuilder sb = new StringBuilder();

        sb.append("Você analisa contas de energia elétrica da CPFL para um cliente no Brasil.\n")
          .append("Recebeu ").append(contas.size()).append(" contas de meses diferentes do mesmo titular.\n\n")
          .append("Responda em português do Brasil, em texto corrido com subtítulos curtos, cobrindo:\n")
          .append("1. Consumo em kWh e valor pago em cada mês, na ordem em que aparecem.\n")
          .append("2. O que mudou entre os meses e a causa mais provável — separe o que é aumento de\n")
          .append("   consumo do que é bandeira tarifária, reajuste, imposto ou taxa de iluminação.\n")
          .append("3. Estimativa de economia com geração solar, em R$ por mês e em percentual,\n")
          .append("   partindo da média de consumo observada.\n")
          .append("4. Três ações práticas, em ordem de impacto.\n\n")
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
    private String corpo(String prompt) throws Exception {
        ObjectNode raiz = mapper.createObjectNode();
        raiz.putArray("contents")
                .addObject()
                .putArray("parts")
                .addObject()
                .put("text", prompt);
        return mapper.writeValueAsString(raiz);
    }

    /**
     * Lê candidates[0].content.parts[*].text.
     *
     * Antes isto era um regex guloso sobre o corpo inteiro. Ele pegava o
     * último "text" da resposta e devolvia com os \n literais — motivo de a
     * análise às vezes chegar truncada ou com barras no meio do texto.
     */
    private String extrairTexto(String json) throws Exception {
        JsonNode partes = mapper.readTree(json)
                .path("candidates").path(0)
                .path("content").path("parts");

        StringBuilder sb = new StringBuilder();
        partes.forEach(parte -> sb.append(parte.path("text").asText("")));

        String texto = sb.toString().trim();
        return texto.isEmpty()
                ? "O modelo não devolveu uma análise para estas contas."
                : texto;
    }
}
