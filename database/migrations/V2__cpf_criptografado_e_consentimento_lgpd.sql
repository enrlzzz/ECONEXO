-- Migração V2 — CPF criptografado em repouso + consentimento LGPD
--
-- APLICAR NO phpMyAdmin DA HOSTINGER **ANTES** DE DAR PUSH.
-- O profile `prod` usa ddl-auto=validate: se as entidades JPA não baterem
-- com as tabelas, o backend se recusa a iniciar.
--
-- Selecione o banco (u..._ECONEXO) antes de executar.

-- 1) CPF passa a guardar o valor cifrado, que é bem maior que 14 caracteres.
ALTER TABLE usuario MODIFY COLUMN cpf VARCHAR(255);

-- 2) Prova de consentimento: o quê, quando e para qual versão da política.
ALTER TABLE usuario
    ADD COLUMN consentimento_lgpd BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN consentimento_em DATETIME NULL,
    ADD COLUMN consentimento_versao VARCHAR(20) NULL;

-- ---------------------------------------------------------------------------
-- CPFs JÁ EXISTENTES
--
-- Registros anteriores a esta mudança continuam em texto puro. O converter os
-- lê normalmente (e loga um aviso), e eles são cifrados no próximo salvamento
-- do cadastro.
--
-- Se a base ainda estiver só com dados de teste, o mais limpo é apagar os
-- CPFs antigos em vez de conviver com a mistura:
--
--     UPDATE usuario SET cpf = NULL;
--
-- Confira antes o que existe:
--     SELECT id_usuario, email, cpf FROM usuario;
-- ---------------------------------------------------------------------------
