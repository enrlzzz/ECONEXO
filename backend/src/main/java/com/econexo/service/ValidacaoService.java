package com.econexo.service;

import com.econexo.dto.CreaValidationRequest;
import com.econexo.dto.CreaValidationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class ValidacaoService {
    private final HttpClient client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();
    private final Map<String, String> fontes = Map.ofEntries(
            Map.entry("SP", "https://www.creasp.org.br/"), Map.entry("AC", "https://www.creaac.org.br/"),
            Map.entry("AL", "https://www.crea-al.org.br/"), Map.entry("AM", "https://www.crea-am.org.br/"),
            Map.entry("BA", "https://www.creaba.org.br/"), Map.entry("CE", "https://www.creace.org.br/"),
            Map.entry("DF", "https://www.creadf.org.br/"), Map.entry("ES", "https://www.creaes.org.br/"),
            Map.entry("GO", "https://www.creago.org.br/"), Map.entry("MG", "https://www.crea-mg.org.br/"),
            Map.entry("MS", "https://www.creams.org.br/"), Map.entry("MT", "https://www.crea-mt.org.br/"),
            Map.entry("PA", "https://www.creapa.org.br/"), Map.entry("PB", "https://creapb.org.br/"),
            Map.entry("PE", "https://www.creape.org.br/"), Map.entry("PR", "https://www.crea-pr.org.br/"),
            Map.entry("RJ", "https://www.crea-rj.org.br/"), Map.entry("RN", "https://www.crea-rn.org.br/"),
            Map.entry("RS", "https://www.crea-rs.org.br/"), Map.entry("SC", "https://portal.crea-sc.org.br/"),
            Map.entry("SE", "https://www.crea-se.org.br/"), Map.entry("TO", "https://www.crea-to.org.br/")
    );

    public CreaValidationResponse consultarCrea(CreaValidationRequest request) {
        String uf = request.uf().trim().toUpperCase();
        String fonte = fontes.getOrDefault(uf, "https://www.confea.org.br/" );
        try {
            String query = "?nome=" + URLEncoder.encode(request.nome().trim(), StandardCharsets.UTF_8)
                    + "&registro=" + URLEncoder.encode(request.registro().trim(), StandardCharsets.UTF_8);
            HttpRequest httpRequest = HttpRequest.newBuilder(URI.create(fonte + query))
                    .header("User-Agent", "EcoNexo/1.0 (consulta publica)").GET().build();
            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            String body = response.body().toLowerCase();
            boolean encontrado = response.statusCode() < 400 && body.contains(request.registro().trim().toLowerCase());
            return new CreaValidationResponse(encontrado ? "ATIVO" : "INCONCLUSIVO",
                    encontrado ? "O registro apareceu na fonte pública consultada." : "O portal oficial respondeu, mas não foi possível confirmar automaticamente o registro. Abra a fonte e confira os dados.", fonte, request.registro(), uf);
        } catch (Exception ex) {
            return new CreaValidationResponse("INCONCLUSIVO", "A consulta automática foi bloqueada ou está indisponível. Confira diretamente no portal oficial do CREA.", fonte, request.registro(), uf);
        }
    }
}
