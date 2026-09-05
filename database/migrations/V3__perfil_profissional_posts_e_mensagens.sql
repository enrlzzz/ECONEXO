-- Migração V3 — perfil profissional + timeline real + mensagens reais
--
-- APLICAR NO phpMyAdmin DA HOSTINGER **ANTES** DE DAR PUSH.
-- O profile `prod` usa ddl-auto=validate: se as entidades JPA não baterem
-- com as tabelas, o backend se recusa a iniciar.
--
-- Selecione o banco (u..._ECONEXO) antes de executar.

-- ---------------------------------------------------------------------------
-- 1) Perfil profissional
--
-- A busca precisa distinguir quem instala de quem assina projeto, e filtrar
-- por praça de atuação. Sem estas colunas, "buscar instalador em Campinas"
-- não tem como responder nada além de "todo mundo".
--
-- cidade/estado NÃO são endereço: é a região onde a pessoa atende.
-- ---------------------------------------------------------------------------
ALTER TABLE usuario
    ADD COLUMN cidade VARCHAR(100) NULL,
    ADD COLUMN estado VARCHAR(2) NULL,
    ADD COLUMN tipo_profissional VARCHAR(20) NULL;

-- ---------------------------------------------------------------------------
-- 2) Timeline
--
-- Substitui os posts que viviam no localStorage do navegador. Ali cada
-- usuário via a própria cópia dos mesmos dados de exemplo e nada era
-- realmente compartilhado.
-- ---------------------------------------------------------------------------
CREATE TABLE post (
    id_post INT AUTO_INCREMENT PRIMARY KEY,
    fk_autor INT NOT NULL,
    texto TEXT NOT NULL,
    criado_em DATETIME NOT NULL,

    FOREIGN KEY (fk_autor) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE INDEX idx_post_criado_em ON post (criado_em DESC);

CREATE TABLE post_comentario (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    fk_post INT NOT NULL,
    fk_autor INT NOT NULL,
    texto TEXT NOT NULL,
    criado_em DATETIME NOT NULL,

    FOREIGN KEY (fk_post) REFERENCES post(id_post)
        ON DELETE CASCADE,
    FOREIGN KEY (fk_autor) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

-- Uma linha por (post, usuário). O contador de likes é COUNT(*), nunca uma
-- coluna incrementada — coluna desanda no primeiro clique duplo.
CREATE TABLE post_curtida (
    id_curtida INT AUTO_INCREMENT PRIMARY KEY,
    fk_post INT NOT NULL,
    fk_usuario INT NOT NULL,
    criado_em DATETIME NOT NULL,

    UNIQUE KEY uk_curtida_post_usuario (fk_post, fk_usuario),

    FOREIGN KEY (fk_post) REFERENCES post(id_post)
        ON DELETE CASCADE,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- 3) Mensagens diretas
--
-- Não há tabela de "conversa": ela é derivada do par (remetente,
-- destinatário) na consulta. Uma tabela de conversa só valeria com grupos,
-- que não existem aqui, e traria o risco de duas conversas paralelas entre
-- as mesmas duas pessoas.
-- ---------------------------------------------------------------------------
CREATE TABLE mensagem (
    id_mensagem INT AUTO_INCREMENT PRIMARY KEY,
    fk_remetente INT NOT NULL,
    fk_destinatario INT NOT NULL,
    texto TEXT NOT NULL,
    criado_em DATETIME NOT NULL,
    -- NULL enquanto o destinatário não abriu a conversa
    lida_em DATETIME NULL,

    FOREIGN KEY (fk_remetente) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (fk_destinatario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE INDEX idx_mensagem_remetente ON mensagem (fk_remetente, criado_em);
CREATE INDEX idx_mensagem_destinatario ON mensagem (fk_destinatario, criado_em);

-- ---------------------------------------------------------------------------
-- 4) Projeto: localização e potência
--
-- O formulário de "Novo Projeto" já pedia cidade, estado e kWp, mas a tabela
-- não tinha onde guardar — os dados eram descartados no refresh da página.
--
-- potencia_kwp é DECIMAL, não FLOAT: 13,2 em ponto flutuante binário vira
-- 13.199999999999999 e isso chega à tela do usuário.
-- ---------------------------------------------------------------------------
ALTER TABLE projeto
    ADD COLUMN cidade VARCHAR(100) NULL,
    ADD COLUMN estado VARCHAR(2) NULL,
    ADD COLUMN potencia_kwp DECIMAL(10,2) NULL;
