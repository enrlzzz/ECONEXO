package com.econexo.service;

import com.econexo.dto.PontoRecargaResponse;
import com.econexo.dto.PontosRecargaResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class PontoRecargaServiceTest {

    private final PontoRecargaService service = new PontoRecargaService("chave-de-teste");

    private static final String JSON = """
        [
          {"ID":101,"NumberOfPoints":2,"UsageCost":"R$ 2,00/kWh",
           "OperatorInfo":{"Title":"Operadora X"},
           "StatusType":{"Title":"Operational","IsOperational":true},
           "AddressInfo":{"Title":"Shopping Iguatemi","AddressLine1":"Rod. Raposo Tavares","Town":"Sorocaba",
                          "Latitude":-23.4851,"Longitude":-47.4237,"ContactEmail":"nao@vaza.com"},
           "Connections":[{"ConnectionType":{"Title":"CCS (Type 2)"},"PowerKW":50.0,"CurrentType":{"Title":"DC"}}]},
          {"ID":102,"AddressInfo":{"Latitude":-23.5,"Longitude":-47.45}},
          {"ID":103,"StatusType":{"IsOperational":false},"AddressInfo":{"Title":"Sem coordenada"}}
        ]
        """;

    @Test
    @DisplayName("Converte o JSON da OCM e descarta ponto sem coordenada")
    void convertePontos() throws Exception {
        PontosRecargaResponse r = service.interpretar(JSON, Instant.now());

        assertThat(r.disponivel()).isTrue();
        assertThat(r.pontos()).hasSize(2);

        PontoRecargaResponse p = r.pontos().get(0);
        assertThat(p.id()).isEqualTo(101);
        assertThat(p.nome()).isEqualTo("Shopping Iguatemi");
        assertThat(p.endereco()).isEqualTo("Rod. Raposo Tavares, Sorocaba");
        assertThat(p.status()).isEqualTo("OPERACIONAL");
        assertThat(p.conectores()).singleElement().satisfies(c -> {
            assertThat(c.tipo()).isEqualTo("CCS (Type 2)");
            assertThat(c.potenciaKw()).isEqualTo(50.0);
        });
    }

    @Test
    @DisplayName("Status ausente vira DESCONHECIDO, nunca 'operacional'")
    void statusAusenteNaoViraOperacional() throws Exception {
        PontoRecargaResponse p = service.interpretar(JSON, Instant.now()).pontos().get(1);
        assertThat(p.status()).isEqualTo("DESCONHECIDO");
        assertThat(p.nome()).isEqualTo("Ponto de recarga");
    }

    @Test
    @DisplayName("Dados de contato da OCM não são repassados")
    void naoRepassaCamposAlheios() throws Exception {
        String saida = new com.fasterxml.jackson.databind.ObjectMapper()
                .findAndRegisterModules()
                .writeValueAsString(service.interpretar(JSON, Instant.now()));
        assertThat(saida).doesNotContain("nao@vaza.com", "ContactEmail");
    }

    @Test
    @DisplayName("Resposta que não é lista é tratada como erro")
    void respostaInesperada() {
        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class,
                () -> service.interpretar("{\"erro\":true}", Instant.now()));
    }

    @Test
    @DisplayName("Sem chave configurada devolve 'indisponível' sem chamar a rede")
    void semChave() {
        PontosRecargaResponse r = new PontoRecargaService("").listar();
        assertThat(r.disponivel()).isFalse();
        assertThat(r.mensagem()).contains("OCM_API_KEY");
        assertThat(r.pontos()).isEmpty();
    }
}
