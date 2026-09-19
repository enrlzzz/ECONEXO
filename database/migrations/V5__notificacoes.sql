CREATE TABLE notificacao (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT NOT NULL, fk_ator INT NULL, tipo VARCHAR(30) NOT NULL,
    texto VARCHAR(255) NOT NULL, referencia_id INT NULL, criado_em DATETIME NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (fk_ator) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    INDEX idx_notificacao_usuario (fk_usuario, criado_em)
);
