-- Migração V6 — credencial CREA dos profissionais
--
-- APLICAR NO phpMyAdmin DA HOSTINGER **ANTES** DE DAR PUSH.
-- O profile `prod` usa ddl-auto=validate: se a tabela não existir, o backend
-- se recusa a subir.
--
-- Selecione o banco (u..._ECONEXO) antes de executar.

-- ---------------------------------------------------------------------------
-- Até aqui o "CREA verificado" vivia só no localStorage do navegador: qualquer
-- pessoa se marcava como verificada pelo DevTools. Agora o estado fica no
-- banco, e só um administrador consegue aprovar.
--
-- Uma credencial por usuário (UNIQUE em fk_usuario). status:
--   PENDENTE   -> enviada, aguardando conferência
--   VERIFICADA -> um administrador conferiu na consulta pública do CREA
--   REJEITADA  -> não confere (ver observacao)
-- ---------------------------------------------------------------------------
CREATE TABLE credencial_crea (
    id_credencial INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT NOT NULL,
    registro VARCHAR(20) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    nome_registro VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    observacao VARCHAR(255) NULL,
    criado_em DATETIME NOT NULL,
    avaliado_em DATETIME NULL,
    avaliado_por INT NULL,
    UNIQUE KEY uk_credencial_crea_usuario (fk_usuario),
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_credencial_crea_status (status, criado_em)
);
