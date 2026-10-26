package com.econexo.service;

import com.econexo.dto.PontoRecargaResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Busca pontos de recarga para veículos elétricos via Open Charge Map.
 *
 * A chave fica no ambiente (OCM_API_KEY) para não vazar no Git.
 * Sem chave a API ainda responde, mas com rate limit mais apertado.
 * Documentação: https://openchargemap.org/site/develop/api
 */
@Service
public class PontosRecargaService {

    private static final Logger log = LoggerFactory.getLogger(PontosRecargaService.class);

    private static final String BASE_URL = "https://api.openchargemap.io/v3/poi/";

    /** Máximo de pontos retornados por busca. */
    private static final int MAX_RESULTADOS = 100;

    @Value("${econexo.ocm.api-key:}")
    private String apiKey;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    public List<PontoRecargaResponse> buscar(double lat, double lng, int raioKm) {
        try {
            StringBuilder url = new StringBuilder(BASE_URL)
                    .append("?output=json")
                    .append("&countrycode=BR")
                    .append("&latitude=").append(lat)
                    .append("&longitude=").append(lng)
                    .append("&distance=").append(raioKm)
                    .append("&distanceunit=KM")
                    .append("&maxresults=").append(MAX_RESULTADOS)
                    .append("&compact=true")
                    .append("&verbose=false");

            if (apiKey != null && !apiKey.isBlank()) {
                url.append("&key=").append(URLEncoder.encode(apiKey, StandardCharsets.UTF_8));
            }

            HttpRequest req = HttpRequest.newBuilder(URI.create(url.toString()))
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                log.warn("OpenChargeMap respondeu {} para lat={} lng={}", response.statusCode(), lat, lng);
                return Collections.emptyList();
            }

            return parsear(response.body());

        } catch (Exception ex) {
            log.warn("Falha ao consultar OpenChargeMap: {}", ex.getClass().getSimpleName());
            return Collections.emptyList();
        }
    }

    private List<PontoRecargaResponse> parsear(String json) throws Exception {
        JsonNode raiz = mapper.readTree(json);
        List<PontoRecargaResponse> lista = new ArrayList<>();

        for (JsonNode ponto : raiz) {
            try {
                lista.add(parsearPonto(ponto));
            } catch (Exception ex) {
                // Ponto com dados incompletos: ignora e processa o próximo.
                log.debug("Ponto ignorado por dados incompletos: {}", ex.getMessage());
            }
        }

        return lista;
    }

    private PontoRecargaResponse parsearPonto(JsonNode ponto) {
        Long id = ponto.path("ID").asLong();

        JsonNode addressInfo = ponto.path("AddressInfo");
        String nome = addressInfo.path("Title").asText("Ponto desconhecido");
        String endereco = addressInfo.path("AddressLine1").asText("");
        double latitude = addressInfo.path("Latitude").asDouble();
        double longitude = addressInfo.path("Longitude").asDouble();

        String status = "DESCONHECIDO";
        JsonNode statusNode = ponto.path("StatusType");
        if (!statusNode.isMissingNode()) {
            status = statusNode.path("Title").asText("DESCONHECIDO");
        }

        List<PontoRecargaResponse.ConectorInfo> conectores = new ArrayList<>();
        JsonNode connections = ponto.path("Connections");
        if (connections.isArray()) {
            for (JsonNode conn : connections) {
                String tipo = conn.path("ConnectionType").path("Title").asText("N/D");
                int nivel = conn.path("Level").path("ID").asInt(1);
                int quantidade = conn.path("Quantity").asInt(1);
                conectores.add(new PontoRecargaResponse.ConectorInfo(tipo, nivel, quantidade));
            }
        }

        return new PontoRecargaResponse(id, nome, endereco, latitude, longitude, status, conectores);
    }
}
