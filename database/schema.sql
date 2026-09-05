-- Schema do EcoNexo (MySQL 8)
--
-- Este arquivo NÃO cria nem seleciona o database — quem escolhe o banco é quem
-- importa. Isso é proposital: em hospedagem compartilhada (Hostinger) a conta
-- não tem permissão de CREATE DATABASE e o nome vem prefixado pelo painel
-- (ex.: u123456789_econexo), então um "create database Econexo" faria o import
-- do phpMyAdmin falhar logo na primeira linha.
--
-- Como carregar em cada ambiente:
--
--   Local (dev):
--     mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Econexo"
--     mysql -u root -p Econexo < database/schema.sql
--
--   Hostinger (produção):
--     hPanel > Databases > cria o banco, depois phpMyAdmin > seleciona o banco
--     criado > aba Importar > envia este arquivo.
--
--   VPS:
--     sudo mysql < deploy/setup-mysql.sql     # cria banco + usuário
--     sudo mysql Econexo < database/schema.sql

create TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    -- hash BCrypt ($2a$12$...), nunca a senha em si
    senha VARCHAR(255) NOT NULL,
    -- criptografado em repouso (AES-256-GCM): 255 porque o cifrado em
    -- base64 é muito maior que os 14 caracteres do CPF em texto
    cpf VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    data_nascimento DATE,
    -- prova de consentimento LGPD (Art. 8º, §2º): o ônus é do controlador
    consentimento_lgpd BOOLEAN NOT NULL DEFAULT FALSE,
    consentimento_em DATETIME,
    consentimento_versao VARCHAR(20),
    -- praça de atuação (não é endereço) — usada pela busca de profissionais
    cidade VARCHAR(100),
    estado VARCHAR(2),
    -- INSTALADOR | PROJETISTA | TECNICO
    tipo_profissional VARCHAR(20)
);

CREATE TABLE skill (
    id_skill INT AUTO_INCREMENT PRIMARY KEY,
    nome_skill VARCHAR(100) NOT NULL,
    categoria VARCHAR(100)
);

CREATE TABLE usuario_skill (
    fk_usuario INT,
    fk_skill INT,
    nivel_proficiencia VARCHAR(50),

    PRIMARY KEY (fk_usuario, fk_skill),

    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (fk_skill) REFERENCES skill(id_skill)
        ON DELETE CASCADE
);

CREATE TABLE endereco (
    id_endereco INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT,
    cep VARCHAR(10),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    logradouro VARCHAR(150),
    numero VARCHAR(10),
    latitude FLOAT,
    longitude FLOAT,

    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE formacao (
    id_formacao INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT,
    instituicao VARCHAR(150),
    diploma VARCHAR(100),
    data_inicio DATE,
    data_fim DATE,

    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE projeto (
    id_projeto INT AUTO_INCREMENT PRIMARY KEY,
    fk_criador INT,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo_projeto VARCHAR(50), -- Portfólio ou Vaga
    status VARCHAR(50),       -- Aberto, Em andamento, Concluído
    data_inicio DATE,
    data_fim DATE,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    -- DECIMAL e nao FLOAT: 13,2 em ponto flutuante binario vira
    -- 13.199999999999999 e isso chega a tela do usuario
    potencia_kwp DECIMAL(10,2),

    FOREIGN KEY (fk_criador) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL
);

CREATE TABLE projeto_participante (
    fk_projeto INT,
    fk_usuario INT,
    papel VARCHAR(50), -- Colaborador / Contratado

    PRIMARY KEY (fk_projeto, fk_usuario),

    FOREIGN KEY (fk_projeto) REFERENCES projeto(id_projeto)
        ON DELETE CASCADE,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE TABLE avaliacao (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    fk_projeto INT,
    fk_avaliador INT,
    fk_avaliado INT,
    estrelas INT CHECK (estrelas BETWEEN 1 AND 5),
    comentario TEXT,

    FOREIGN KEY (fk_projeto) REFERENCES projeto(id_projeto)
        ON DELETE CASCADE,
    FOREIGN KEY (fk_avaliador) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (fk_avaliado) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- Timeline
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

-- Uma linha por (post, usuário): o total de curtidas é COUNT(*), nunca uma
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
-- Mensagens diretas
--
-- A "conversa" é derivada do par (remetente, destinatário) na consulta —
-- não existe tabela de conversa. Só faria sentido com grupos, que não há.
-- ---------------------------------------------------------------------------
CREATE TABLE mensagem (
    id_mensagem INT AUTO_INCREMENT PRIMARY KEY,
    fk_remetente INT NOT NULL,
    fk_destinatario INT NOT NULL,
    texto TEXT NOT NULL,
    criado_em DATETIME NOT NULL,
    lida_em DATETIME NULL,

    FOREIGN KEY (fk_remetente) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (fk_destinatario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

CREATE INDEX idx_mensagem_remetente ON mensagem (fk_remetente, criado_em);
CREATE INDEX idx_mensagem_destinatario ON mensagem (fk_destinatario, criado_em);
