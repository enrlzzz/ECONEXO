package com.econexo;

import com.econexo.model.Usuario;
import com.econexo.repository.UsuarioRepository;
import com.econexo.security.RateLimitService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Verifica as correções críticas e altas da auditoria de segurança.
 *
 * Cada teste corresponde a um item do relatório. Se algum destes quebrar, uma
 * vulnerabilidade já corrigida foi reaberta — não faça merge.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SegurancaIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired com.econexo.repository.AvaliacaoRepository avaliacaoRepository;
    @Autowired com.econexo.repository.EnderecoRepository enderecoRepository;
    @Autowired com.econexo.repository.FormacaoRepository formacaoRepository;
    @Autowired com.econexo.repository.PostCurtidaRepository postCurtidaRepository;
    @Autowired com.econexo.repository.PostComentarioRepository postComentarioRepository;
    @Autowired com.econexo.repository.PostRepository postRepository;
    @Autowired com.econexo.repository.MensagemRepository mensagemRepository;
    @Autowired com.econexo.repository.ProjetoRepository projetoRepository;
    @Autowired ObjectMapper json;
    @Autowired RateLimitService rateLimitService;
    @Autowired jakarta.persistence.EntityManager entityManager;

    private static final String EMAIL = "ricardo@econexo.test";
    private static final String SENHA = "SenhaForte123";

    @BeforeEach
    void limpar() {
        // Filhos antes do pai. No MySQL de produção as FKs têm ON DELETE
        // CASCADE (ver database/schema.sql), mas no H2 quem cria o schema é o
        // Hibernate, e ele gera as FKs sem cascade — apagar usuário direto
        // estoura violação de integridade.
        postCurtidaRepository.deleteAll();
        postComentarioRepository.deleteAll();
        postRepository.deleteAll();
        mensagemRepository.deleteAll();
        avaliacaoRepository.deleteAll();
        enderecoRepository.deleteAll();
        formacaoRepository.deleteAll();
        projetoRepository.deleteAll();
        usuarioRepository.deleteAll();
        // No MockMvc todas as requisições vêm do mesmo IP: sem zerar, o
        // bloqueio gerado pelo teste de rate limit vazaria para os demais.
        rateLimitService.limparTudo();
    }

    private String cadastrar() throws Exception {
        String corpo = """
            {"nome":"Ricardo Teste","email":"%s","senha":"%s",
             "cpf":"12345678901","telefone":"15999998888","dataNascimento":"1990-05-10",
             "consentimentoLgpd":true}
            """.formatted(EMAIL, SENHA);

        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content(corpo))
           .andExpect(status().isCreated());

        return logar(EMAIL, SENHA);
    }

    private String logar(String email, String senha) throws Exception {
        MvcResult r = mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"senha\":\"%s\"}".formatted(email, senha)))
                .andReturn();

        if (r.getResponse().getStatus() != 200) return null;
        return json.readTree(r.getResponse().getContentAsString()).get("token").asText();
    }

    // ---------- C1: API nunca devolve senha nem CPF ----------

    @Test
    @DisplayName("C1 - listagem de usuários não expõe senha nem CPF")
    void listagemNaoExpoeDadosSensiveis() throws Exception {
        String token = cadastrar();

        MvcResult r = mvc.perform(get("/api/usuarios").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        String corpo = r.getResponse().getContentAsString();
        assertThat(corpo).doesNotContain("senha", "cpf", "12345678901");
        assertThat(corpo).contains("Ricardo Teste");
    }

    @Test
    @DisplayName("C1 - diretorio nao expoe e-mail nem telefone de terceiros")
    void diretorioNaoExpoeContatoAlheio() throws Exception {
        String tokenA = cadastrar();

        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Outra Pessoa","email":"outra@econexo.test","senha":"OutraSenha123",
                 "telefone":"11988887777","consentimentoLgpd":true}
                """)).andExpect(status().isCreated());

        String corpo = mvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // O nome e publico (e o ponto do diretorio). O contato nao: com o
        // e-mail de todo mundo numa resposta, a busca vira raspador da base.
        assertThat(corpo).contains("Outra Pessoa");
        assertThat(corpo).doesNotContain("outra@econexo.test", "11988887777");
    }

    @Test
    @DisplayName("C1 - buscar outro usuario nao devolve o cadastro completo")
    void perfilAlheioNaoTrazContato() throws Exception {
        String tokenA = cadastrar();

        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Alvo","email":"alvo@econexo.test","senha":"SenhaAlvo123",
                 "telefone":"11977776666","consentimentoLgpd":true}
                """)).andExpect(status().isCreated());

        Integer idAlvo = usuarioRepository.findByEmail("alvo@econexo.test")
                .orElseThrow().getIdUsuario();

        String alheio = mvc.perform(get("/api/usuarios/" + idAlvo)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(alheio).contains("Alvo");
        assertThat(alheio).doesNotContain("alvo@econexo.test", "11977776666");

        // Mas o proprio cadastro continua vindo completo — a tela de
        // Configuracoes depende disso para preencher o formulario.
        Integer idProprio = usuarioRepository.findByEmail(EMAIL).orElseThrow().getIdUsuario();
        String proprio = mvc.perform(get("/api/usuarios/" + idProprio)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(proprio).contains(EMAIL);
    }

    @Test
    @DisplayName("B1 - enderecos: cada um so enxerga os seus")
    void enderecoNaoVazaParaOutroUsuario() throws Exception {
        String tokenA = cadastrar();

        mvc.perform(post("/api/enderecos")
                .header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"cep":"18000-000","cidade":"Sorocaba","estado":"SP",
                     "logradouro":"Rua Secreta","numero":"42"}
                    """))
           .andExpect(status().isCreated());

        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Bisbilhoteiro","email":"bis@econexo.test","senha":"SenhaBis123",
                 "consentimentoLgpd":true}
                """)).andExpect(status().isCreated());

        String tokenB = logar("bis@econexo.test", "SenhaBis123");

        // Endereco residencial e o dado mais sensivel fora de senha e CPF:
        // a rota antiga fazia findAll() e entregava a base inteira.
        String vistoPorB = mvc.perform(get("/api/enderecos")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(vistoPorB).isEqualTo("[]");
        assertThat(vistoPorB).doesNotContain("Rua Secreta", "18000-000");

        String vistoPorA = mvc.perform(get("/api/enderecos")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(vistoPorA).contains("Rua Secreta");
    }

    @Test
    @DisplayName("B1 - avaliacao nao pode ser assinada em nome de outro")
    void avaliacaoUsaAvaliadorDoToken() throws Exception {
        String tokenA = cadastrar();

        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Avaliado","email":"avaliado@econexo.test","senha":"SenhaAv123",
                 "consentimentoLgpd":true}
                """)).andExpect(status().isCreated());

        Integer idAvaliado = usuarioRepository.findByEmail("avaliado@econexo.test")
                .orElseThrow().getIdUsuario();
        Integer idA = usuarioRepository.findByEmail(EMAIL).orElseThrow().getIdUsuario();

        // Tenta forjar o avaliador no corpo. O campo nem existe no DTO, entao
        // e ignorado — e o avaliador gravado tem que ser o dono do token.
        String corpo = mvc.perform(post("/api/avaliacoes")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"avaliadoId":%d,"estrelas":5,"comentario":"Otimo",
                             "avaliador":{"idUsuario":%d}}
                            """.formatted(idAvaliado, idAvaliado)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        assertThat(json.readTree(corpo).get("avaliador").get("idUsuario").asInt())
                .isEqualTo(idA);
    }

    @Test
    @DisplayName("C1 - resposta do cadastro não devolve a senha")
    void cadastroNaoDevolveSenha() throws Exception {
        MvcResult r = mvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"nome":"Joao","email":"joao@econexo.test","senha":"SenhaForte123","consentimentoLgpd":true}
                    """))
                .andExpect(status().isCreated())
                .andReturn();

        assertThat(r.getResponse().getContentAsString())
                .doesNotContain("SenhaForte123", "senha");
    }

    // ---------- M2: CPF criptografado em repouso ----------

    @Test
    @DisplayName("M2 - CPF é gravado criptografado, ilegível no banco")
    void cpfEhCriptografadoNoBanco() throws Exception {
        cadastrar();

        // Consulta crua, sem passar pelo JPA: é o que um dump do banco ou uma
        // SQL injection enxergariam.
        String armazenado = (String) entityManager
                .createNativeQuery("SELECT cpf FROM usuario WHERE email = :e")
                .setParameter("e", EMAIL)
                .getSingleResult();

        assertThat(armazenado).isNotNull();
        assertThat(armazenado).doesNotContain("12345678901");
        assertThat(armazenado).startsWith("enc:v1:");
    }

    @Test
    @DisplayName("M2 - a aplicação continua lendo o CPF normalmente")
    void cpfEhLegivelPelaAplicacao() throws Exception {
        cadastrar();

        Usuario u = usuarioRepository.findByEmail(EMAIL).orElseThrow();
        assertThat(u.getCpf()).isEqualTo("12345678901");
    }

    @Test
    @DisplayName("M2 - UNIQUE do CPF continua valendo mesmo cifrado")
    void cpfDuplicadoAindaEhBarrado() throws Exception {
        cadastrar();

        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Clone","email":"clone@econexo.test","senha":"SenhaForte123",
                 "cpf":"12345678901","consentimentoLgpd":true}
                """))
           .andExpect(status().isConflict());
    }

    // ---------- M2: consentimento LGPD ----------

    @Test
    @DisplayName("LGPD - cadastro sem consentimento é recusado")
    void cadastroSemConsentimentoEhRecusado() throws Exception {
        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Sem Aceite","email":"semaceite@econexo.test","senha":"SenhaForte123"}
                """))
           .andExpect(status().isBadRequest());

        assertThat(usuarioRepository.findByEmail("semaceite@econexo.test")).isEmpty();
    }

    @Test
    @DisplayName("LGPD - consentimento é gravado com data e versão da política")
    void consentimentoEhComprovavel() throws Exception {
        cadastrar();

        Usuario u = usuarioRepository.findByEmail(EMAIL).orElseThrow();
        assertThat(u.getConsentimentoLgpd()).isTrue();
        assertThat(u.getConsentimentoEm()).isNotNull();
        assertThat(u.getConsentimentoVersao()).isNotBlank();
    }

    // ---------- C2: senha com BCrypt ----------

    @Test
    @DisplayName("C2 - senha é gravada com hash BCrypt, nunca em texto puro")
    void senhaEhHasheada() throws Exception {
        cadastrar();

        Usuario u = usuarioRepository.findByEmail(EMAIL).orElseThrow();
        assertThat(u.getSenha()).isNotEqualTo(SENHA);
        assertThat(u.getSenha()).startsWith("$2a$12$");
    }

    // ---------- C3: rotas protegidas ----------

    @Test
    @DisplayName("C3 - listar usuários sem token devolve 401")
    void semTokenEhRejeitado() throws Exception {
        mvc.perform(get("/api/usuarios")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("C3 - token forjado/adulterado é rejeitado")
    void tokenInvalidoEhRejeitado() throws Exception {
        mvc.perform(get("/api/usuarios").header("Authorization", "Bearer nao.e.um.token"))
           .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("C3 - outras entidades também exigem autenticação")
    void outrosEndpointsProtegidos() throws Exception {
        mvc.perform(get("/api/skills")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/projetos")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("C3 - /health responde 200 sem token e nao vaza nada")
    void healthEhPublicoEEnxuto() throws Exception {
        String corpo = mvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // O keep-alive so precisa saber que a instancia esta de pe. Se um dia
        // alguem enfiar versao, env ou detalhe de banco aqui, este teste quebra:
        // o endpoint e publico, tudo que ele devolver e publico.
        assertThat(corpo).isEqualTo("{\"status\":\"ok\"}");
    }

    // ---------- C4: login por corpo ----------

    @Test
    @DisplayName("C4 - login por query string não funciona mais")
    void loginPorQueryStringNaoFunciona() throws Exception {
        cadastrar();
        mvc.perform(post("/api/usuarios/login")
                .param("email", EMAIL)
                .param("senha", SENHA))
           .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("C4 - login por corpo devolve token")
    void loginPorCorpoFunciona() throws Exception {
        assertThat(cadastrar()).isNotBlank();
    }

    // ---------- B1: IDOR ----------

    @Test
    @DisplayName("B1 - usuário não consegue alterar o cadastro de outro")
    void naoAlteraCadastroAlheio() throws Exception {
        String tokenA = cadastrar();

        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Vitima","email":"vitima@econexo.test","senha":"OutraSenha123","consentimentoLgpd":true}
                """)).andExpect(status().isCreated());

        Integer idVitima = usuarioRepository.findByEmail("vitima@econexo.test")
                .orElseThrow().getIdUsuario();

        mvc.perform(put("/api/usuarios/" + idVitima)
                .header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"nome":"Invadido","email":"vitima@econexo.test","senha":"NovaSenha123","consentimentoLgpd":true}
                    """))
           .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("B1 - usuário não consegue excluir a conta de outro")
    void naoExcluiContaAlheia() throws Exception {
        String tokenA = cadastrar();

        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"nome":"Vitima2","email":"vitima2@econexo.test","senha":"OutraSenha123","consentimentoLgpd":true}
                """)).andExpect(status().isCreated());

        Integer idVitima = usuarioRepository.findByEmail("vitima2@econexo.test")
                .orElseThrow().getIdUsuario();

        mvc.perform(delete("/api/usuarios/" + idVitima)
                .header("Authorization", "Bearer " + tokenA))
           .andExpect(status().isForbidden());

        assertThat(usuarioRepository.findById(idVitima)).isPresent();
    }

    // ---------- B2: mass assignment ----------

    @Test
    @DisplayName("B2 - id enviado no corpo do cadastro é ignorado")
    void idNoCorpoEhIgnorado() throws Exception {
        mvc.perform(post("/api/usuarios").contentType(MediaType.APPLICATION_JSON).content("""
                {"idUsuario":999,"nome":"Fulano","email":"fulano@econexo.test","senha":"SenhaForte123","consentimentoLgpd":true}
                """)).andExpect(status().isCreated());

        assertThat(usuarioRepository.findById(999)).isEmpty();
    }

    // ---------- B3: rate limit ----------

    @Test
    @DisplayName("B3 - 10 tentativas de login erradas bloqueiam com 429")
    void rateLimitBloqueiaAposDezTentativas() throws Exception {
        cadastrar();

        for (int i = 0; i < 9; i++) {
            mvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"%s\",\"senha\":\"errada%d\"}".formatted(EMAIL, i)))
               .andExpect(status().isUnauthorized());
        }

        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"senha\":\"errada9\"}".formatted(EMAIL)))
           .andExpect(status().isUnauthorized());

        // 11ª: já bloqueado — e nem a senha certa passa.
        mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"senha\":\"%s\"}".formatted(EMAIL, SENHA)))
           .andExpect(status().isTooManyRequests())
           .andExpect(header().exists("Retry-After"));
    }

    // ---------- B6/B7: erros sem vazamento ----------

    @Test
    @DisplayName("B6 - erro de validação não vaza stack trace")
    void validacaoNaoVazaStackTrace() throws Exception {
        MvcResult r = mvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"nome":"","email":"nao-e-email","senha":"123"}
                    """))
                .andExpect(status().isBadRequest())
                .andReturn();

        String corpo = r.getResponse().getContentAsString();
        assertThat(corpo).doesNotContain("org.hibernate", "java.lang", "Exception", "at com.econexo");
        assertThat(corpo).contains("campos");
    }

    @Test
    @DisplayName("B7 - e-mail duplicado não revela que a conta existe")
    void emailDuplicadoNaoVazaExistencia() throws Exception {
        cadastrar();

        MvcResult r = mvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"nome":"Outro","email":"%s","senha":"SenhaForte123","consentimentoLgpd":true}
                    """.formatted(EMAIL)))
                .andExpect(status().isConflict())
                .andReturn();

        String corpo = r.getResponse().getContentAsString();
        assertThat(corpo).doesNotContain("já está cadastrado", "duplicate", "Duplicate", "usuario.email");
    }

    // ---------- Login: mesma resposta para usuário inexistente e senha errada ----------

    @Test
    @DisplayName("Login não permite enumerar quem tem conta")
    void loginNaoPermiteEnumeracao() throws Exception {
        cadastrar();

        MvcResult inexistente = mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"ninguem@econexo.test\",\"senha\":\"qualquer\"}"))
                .andReturn();

        MvcResult senhaErrada = mvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"senha\":\"errada\"}".formatted(EMAIL)))
                .andReturn();

        assertThat(inexistente.getResponse().getStatus())
                .isEqualTo(senhaErrada.getResponse().getStatus());

        // O campo "momento" é um timestamp e sempre difere; o resto da
        // resposta tem que ser idêntico, senão dá para distinguir os casos.
        assertThat(semTimestamp(inexistente))
                .isEqualTo(semTimestamp(senhaErrada));
    }

    private String semTimestamp(MvcResult r) throws Exception {
        return r.getResponse().getContentAsString()
                .replaceAll("\"momento\":\"[^\"]+\"", "\"momento\":\"-\"");
    }
}
