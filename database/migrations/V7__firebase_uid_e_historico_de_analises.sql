-- Migração V7 — login pelo Firebase e histórico de contas analisadas
--
-- APLICAR NO phpMyAdmin DA HOSTINGER **ANTES** DE DAR PUSH NA main.
-- O profile `prod` usa ddl-auto=validate: se a coluna ou a tabela não
-- existirem, o backend se recusa a subir.
--
-- Selecione o banco (u..._ECONEXO) antes de executar.

-- ---------------------------------------------------------------------------
-- 1) firebase_uid: o login passou para o Firebase Authentication. O backend
--    valida o ID token do Firebase e usa este UID para achar o cadastro.
--    NULL para contas antigas até a primeira entrada pelo Firebase — o
--    vínculo por e-mail só acontece com e-mail verificado (ver
--    FirebaseAuthService).
-- ---------------------------------------------------------------------------
ALTER TABLE usuario
    ADD COLUMN firebase_uid VARCHAR(128) NULL,
    ADD UNIQUE KEY uk_usuario_firebase_uid (firebase_uid);

-- ---------------------------------------------------------------------------
-- 2) Histórico das análises de conta de energia. Só o TEXTO da análise e os
--    números por mês ficam salvos — nunca o PDF nem o texto da conta (que
--    traz nome, CPF e endereço do titular).
-- ---------------------------------------------------------------------------
CREATE TABLE analise_conta (
    id_analise INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT NOT NULL,
    criada_em DATETIME NOT NULL,
    resumo VARCHAR(200) NOT NULL,
    analise TEXT NOT NULL,
    meses_json TEXT NULL,
    consumo_medio_kwh DECIMAL(10,2) NULL,
    valor_medio DECIMAL(10,2) NULL,
    economia_solar_mensal DECIMAL(10,2) NULL,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_analise_conta_usuario (fk_usuario, criada_em)
);
