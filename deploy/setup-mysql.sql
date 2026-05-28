-- Script para criar usuário de aplicação e dar acesso ao banco Econexo.
-- Rodar UMA VEZ no servidor como root:
--   sudo mysql < /var/www/econexo/deploy/setup-mysql.sql
--
-- IMPORTANTE: troque 'TROQUE_POR_UMA_SENHA_FORTE' por uma senha forte
-- e atualize /etc/econexo/backend.env com o mesmo valor.

CREATE DATABASE IF NOT EXISTS Econexo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'econexo_app'@'localhost'
    IDENTIFIED BY 'TROQUE_POR_UMA_SENHA_FORTE';

GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE
    ON Econexo.*
    TO 'econexo_app'@'localhost';

-- Permissões necessárias só na primeira carga do schema (DDL).
-- Pode revogar depois que rodar schema.sql para reduzir blast radius.
GRANT CREATE, ALTER, INDEX, DROP, REFERENCES
    ON Econexo.*
    TO 'econexo_app'@'localhost';

FLUSH PRIVILEGES;
