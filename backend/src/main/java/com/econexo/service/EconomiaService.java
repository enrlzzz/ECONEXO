package com.econexo.service;

import com.econexo.dto.EconomiaRequest;
import com.econexo.dto.EconomiaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.*;

@Service
public class EconomiaService {
    @Value("${econexo.gemini.api-key:}") private String apiKey;
    private final HttpClient client = HttpClient.newHttpClient();
    public EconomiaResponse analisar(EconomiaRequest request) {
        if (apiKey == null || apiKey.isBlank()) return new EconomiaResponse("Análise indisponível: configure GEMINI_API_KEY no ambiente do backend.", "configuração");
        String prompt = "Analise esta conta de energia CPFL e responda em português com: valor atual, consumo, possíveis causas de aumento, economia estimada e três ações práticas. Não invente dados ausentes. Conta:\n" + request.conta();
        String body = "{\"contents\":[{\"parts\":[{\"text\":" + json(prompt) + "}]}]}";
        try { var req = HttpRequest.newBuilder(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey)).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build(); var response = client.send(req, HttpResponse.BodyHandlers.ofString()); if (response.statusCode() >= 400) return new EconomiaResponse("Não foi possível analisar a conta agora. Verifique a configuração do Gemini.", "gemini"); String text = response.body().replaceAll(".*\\\"text\\\":\\\"(.*?)\\\".*", "$1").replace("\\n", "\n"); return new EconomiaResponse(text, "Gemini 2.5 Flash"); } catch (Exception ex) { return new EconomiaResponse("Não foi possível analisar a conta agora.", "gemini"); }
    }
    private String json(String value) { return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\""; }
}
