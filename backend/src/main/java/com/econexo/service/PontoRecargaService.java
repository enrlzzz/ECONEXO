package com.econexo.service;

import com.econexo.dto.PontoRecargaResponse;
import com.econexo.dto.PontoRecargaResponse.Conector;
import com.econexo.dto.PontosRecargaResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Pontos de recarga de veículos elétricos em Sorocaba, via Open Charge Map.
 *
 * A chave da OCM fica só aqui no servidor (regra 8 do CLAUDE.md) — o navegador
 * fala com a nossa API, nunca com a OCM. O resultado fica em cache: os dados
 * mudam devagar, a cota da OCM é limitada e o backend no Render hiberna, o que
 * deixaria cada abertura de mapa lenta se consultássemos a cada requisição.
 */
@Service
public class PontoRecargaService {

    private static final Logger log = LoggerFactory.getLogger(PontoRecargaService.class);

    private static final String ENDPOINT = "https://api.openchargemap.io/v3/poi";

    // Centro de Sorocaba e raio que cobre o município e o entorno imediato.
    private static final double LATITUDE = -23.5015;
    private static final double LONGITUDE = -47.4526;
    private static final int RAIO_KM = 25;
    private static final int MAX_RESULTADOS = 200;

    private static final Duration VALIDADE_CACHE = Duration.ofHours(24);
    // Falha também é guardada, por pouco tempo: sem isso, uma OCM fora do ar
    // faria cada abertura de mapa disparar uma chamada que já sabemos que falha.
    private static final Duration VALIDADE_FALHA = Duration.ofMinutes(2);

    private static final String MSG_SEM_CHAVE =
            "Mapa indisponível: a chave da Open Charge Map (OCM_API_KEY) não está configurada.";
    private static final String MSG_FALHA =
            "Não foi possível carregar os pontos de recarga agora. Tente de novo em alguns minutos.";

    private final String apiKey;
    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper mapper = new ObjectMapper();

    private PontosRecargaResponse cache;
    private Instant cacheExpiraEm = Instant.EPOCH;

    public PontoRecargaService(@Value("${econexo.ocm.api-key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    public synchronized PontosRecargaResponse listar() {
        if (apiKey == null || apiKey.isBlank()) {
            return PontosRecargaResponse.indisponivel(MSG_SEM_CHAVE);
        }

        Instant agora = Instant.now();
        if (cache != null && agora.isBefore(cacheExpiraEm)) {
            return cache;
        }

        try {
            PontosRecargaResponse fresco = interpretar(buscar(), agora);
            cache = fresco;
            cacheExpiraEm = agora.plus(VALIDADE_CACHE);
            return fresco;
        } catch (Exception ex) {
            // Só a classe da exceção no log: a URL da requisição leva a chave.
            log.warn("Falha ao consultar a Open Charge Map: {}", ex.getClass().getSimpleName());

            // Dado de ontem vale mais que mapa vazio.
            if (cache != null && cache.disponivel()) {
                cacheExpiraEm = agora.plus(VALIDADE_FALHA);
                return cache;
            }
            cache = PontosRecargaResponse.indisponivel(MSG_FALHA);
            cacheExpiraEm = agora.plus(VALIDADE_FALHA);
            return cache;
        }
    }

    private String buscar() throws Exception {
        String url = ENDPOINT
                + "?output=json&countrycode=BR"
                + "&latitude=" + LATITUDE + "&longitude=" + LONGITUDE
                + "&distance=" + RAIO_KM + "&distanceunit=KM"
                + "&maxresults=" + MAX_RESULTADOS
                // verbose=false tira só os campos nulos; compact=true
                // trocaria os títulos (conector, status) por IDs.
                + "&compact=false&verbose=false";

        HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                .header("X-API-Key", apiKey)
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(20))
                .GET()
                .build();

        HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new IllegalStateException("OCM respondeu " + response.statusCode());
        }
        return response.body();
    }

    /** Visível ao pacote para teste: converte o JSON da OCM no nosso DTO. */
    PontosRecargaResponse interpretar(String json, Instant quando) throws Exception {
        JsonNode raiz = mapper.readTree(json);
        if (!raiz.isArray()) {
            throw new IllegalStateException("Resposta inesperada da OCM");
        }

        List<PontoRecargaResponse> pontos = new ArrayList<>();
        for (JsonNode poi : raiz) {
            JsonNode end = poi.path("AddressInfo");
            // Sem coordenada não há o que desenhar no mapa.
            if (!end.path("Latitude").isNumber() || !end.path("Longitude").isNumber()) {
                continue;
            }

            List<Conector> conectores = new ArrayList<>();
            for (JsonNode c : poi.path("Connections")) {
                conectores.add(new Conector(
                        texto(c.path("ConnectionType").path("Title")),
                        c.path("PowerKW").isNumber() ? c.path("PowerKW").asDouble() : null,
                        texto(c.path("CurrentType").path("Title"))));
            }

            pontos.add(new PontoRecargaResponse(
                    poi.path("ID").asLong(),
                    textoOu(end.path("Title"), "Ponto de recarga"),
                    montarEndereco(end),
                    end.path("Latitude").asDouble(),
                    end.path("Longitude").asDouble(),
                    texto(poi.path("OperatorInfo").path("Title")),
                    status(poi.path("StatusType")),
                    poi.path("NumberOfPoints").isInt() ? poi.path("NumberOfPoints").asInt() : null,
                    texto(poi.path("UsageCost")),
                    conectores));
        }

        return new PontosRecargaResponse(true, null, "Open Charge Map", quando, pontos);
    }

    private static String status(JsonNode statusType) {
        // OCM deixa IsOperational ausente quando ninguém informou: não
        // transformamos "não sei" em "disponível".
        if (!statusType.path("IsOperational").isBoolean()) return "DESCONHECIDO";
        return statusType.path("IsOperational").asBoolean() ? "OPERACIONAL" : "FORA_DO_AR";
    }

    private static String montarEndereco(JsonNode end) {
        List<String> partes = new ArrayList<>();
        for (String campo : new String[]{"AddressLine1", "Town"}) {
            String t = texto(end.path(campo));
            if (t != null) partes.add(t);
        }
        return partes.isEmpty() ? null : String.join(", ", partes);
    }

    private static String texto(JsonNode no) {
        if (!no.isTextual()) return null;
        String t = no.asText().trim();
        return t.isEmpty() ? null : t;
    }

    private static String textoOu(JsonNode no, String padrao) {
        String t = texto(no);
        return t != null ? t : padrao;
    }
}
