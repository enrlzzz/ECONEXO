package com.econexo;

import com.econexo.dto.EconomiaResponse;
import com.econexo.dto.MesConta;
import com.econexo.model.Usuario;
import com.econexo.repository.AnaliseContaRepository;
import com.econexo.repository.UsuarioRepository;
import com.econexo.security.FirebaseTokenService;
import com.econexo.security.IdentidadeFirebase;
import com.econexo.security.RateLimitService;
import com.econexo.service.EconomiaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Login pelo Firebase e histórico de análises.
 *
 * O FirebaseTokenService é simulado: o teste não pode depender da rede do
 * Google. O que está sob teste é o que o backend FAZ com uma identidade já
 * validada — vincular, criar, recusar — e quem enxerga qual histórico.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FirebaseEHistoricoIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired AnaliseContaRepository analiseContaRepository;
    @Autowired RateLimitService rateLimitService;
    @Autowired ObjectMapper json;

    @MockitoBean FirebaseTokenService firebase;
    @MockitoBean EconomiaService economia;

    private static final String CONTAS = "{\"contas\":[\"conta de julho\",\"conta de agosto\"]}";
    private static final String CADASTRO_OK = "{\"nome\":\"Ana Teste\",\"consentimentoLgpd\":true}";

    @BeforeEach
    void preparar() {
        analiseContaRepository.deleteAll();
        usuarioRepository.findAll().stream()
                .filter(u -> u.getEmail().endsWith("@firebase.test"))
                .forEach(usuarioRepository::delete);
        rateLimitService.limparTudo();

        identidade("tok-ana", "uid-ana", "ana@firebase.test", true);
        identidade("tok-bia", "uid-bia", "bia@firebase.test", true);

        when(economia.analisar(any())).thenReturn(new EconomiaResponse(
                "## Resumo\n- Subiu por causa da bandeira.", "teste", "Subiu 10%",
                List.of(new MesConta("07/2026", new BigDecimal("300"), new BigDecimal("250.00")),
                        new MesConta("08/2026", new BigDecimal("320"), new BigDecimal("275.00"))),
                new BigDecimal("200.00"), null));
    }

    private void identidade(String token, String uid, String email, boolean verificado) {
        when(firebase.verificar(token)).thenReturn(Optional.of(new IdentidadeFirebase(uid, email, verificado, null)));
    }

    private void entrar(String token) throws Exception {
        mvc.perform(post("/api/auth/firebase").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(CADASTRO_OK))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Firebase - sem token válido, o vínculo é recusado com 401")
    void vinculoSemTokenEhRecusado() throws Exception {
        mvc.perform(post("/api/auth/firebase").contentType(MediaType.APPLICATION_JSON).content(CADASTRO_OK))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/firebase").header("Authorization", "Bearer forjado")
                        .contentType(MediaType.APPLICATION_JSON).content(CADASTRO_OK))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Firebase - cadastro novo exige consentimento LGPD (428 sem ele)")
    void cadastroNovoExigeConsentimento() throws Exception {
        mvc.perform(post("/api/auth/firebase").header("Authorization", "Bearer tok-ana")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nome\":\"Ana\"}"))
                .andExpect(status().is(428));
        assertThat(usuarioRepository.findByFirebaseUid("uid-ana")).isEmpty();

        mvc.perform(post("/api/auth/firebase").header("Authorization", "Bearer tok-ana")
                        .contentType(MediaType.APPLICATION_JSON).content(CADASTRO_OK))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.novo").value(true))
                .andExpect(jsonPath("$.usuario.email").value("ana@firebase.test"))
                .andExpect(jsonPath("$.usuario.senha").doesNotExist());

        Usuario salvo = usuarioRepository.findByFirebaseUid("uid-ana").orElseThrow();
        assertThat(salvo.getConsentimentoEm()).isNotNull();
        assertThat(salvo.getConsentimentoVersao()).isNotBlank();
    }

    @Test
    @DisplayName("Firebase - e-mail de conta antiga só vincula se verificado")
    void contaAntigaSoVinculaComEmailVerificado() throws Exception {
        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Carla Antiga","email":"carla@firebase.test","senha":"SenhaForte123","consentimentoLgpd":true}
                """)).andExpect(status().isCreated());

        identidade("tok-falsa", "uid-intruso", "carla@firebase.test", false);
        mvc.perform(post("/api/auth/firebase").header("Authorization", "Bearer tok-falsa"))
                .andExpect(status().isConflict());
        assertThat(usuarioRepository.findByFirebaseUid("uid-intruso")).isEmpty();

        identidade("tok-carla", "uid-carla", "carla@firebase.test", true);
        mvc.perform(post("/api/auth/firebase").header("Authorization", "Bearer tok-carla"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.novo").value(false))
                .andExpect(jsonPath("$.usuario.nome").value("Carla Antiga"));
    }

    @Test
    @DisplayName("Análise - visitante analisa sem login e nada é salvo")
    void visitanteAnalisaSemSalvar() throws Exception {
        mvc.perform(post("/api/economia/analisar").contentType(MediaType.APPLICATION_JSON).content(CONTAS))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resumo").value("Subiu 10%"))
                .andExpect(jsonPath("$.idAnalise").doesNotExist());
        assertThat(analiseContaRepository.count()).isZero();
    }

    @Test
    @DisplayName("Análise - logado salva e vê no histórico; terceiro não vê nem apaga")
    void historicoEhDoDono() throws Exception {
        entrar("tok-ana");
        entrar("tok-bia");

        String corpo = mvc.perform(post("/api/economia/analisar").header("Authorization", "Bearer tok-ana")
                        .contentType(MediaType.APPLICATION_JSON).content(CONTAS))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idAnalise").isNumber())
                .andReturn().getResponse().getContentAsString();
        int id = json.readTree(corpo).get("idAnalise").asInt();

        mvc.perform(get("/api/economia/historico").header("Authorization", "Bearer tok-ana"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].resumo").value("Subiu 10%"))
                .andExpect(jsonPath("$[0].periodo").value("07/2026 – 08/2026"))
                .andExpect(jsonPath("$[0].valorMedio").value(262.5));

        mvc.perform(get("/api/economia/historico").header("Authorization", "Bearer tok-bia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/economia/historico/" + id).header("Authorization", "Bearer tok-bia"))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/economia/historico/" + id).header("Authorization", "Bearer tok-bia"))
                .andExpect(status().isNotFound());
        assertThat(analiseContaRepository.count()).isEqualTo(1);

        mvc.perform(delete("/api/economia/historico/" + id).header("Authorization", "Bearer tok-ana"))
                .andExpect(status().isNoContent());
        assertThat(analiseContaRepository.count()).isZero();
    }

    @Test
    @DisplayName("Análise - histórico exige autenticação")
    void historicoExigeLogin() throws Exception {
        mvc.perform(get("/api/economia/historico")).andExpect(status().isUnauthorized());
    }
}
