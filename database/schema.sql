create database if not exists Econexo;
use Econexo;

create TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    data_nascimento DATE
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