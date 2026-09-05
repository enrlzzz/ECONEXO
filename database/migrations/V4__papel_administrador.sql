-- Migração V4 — papel de administrador
--
-- APLICAR NO phpMyAdmin DA HOSTINGER **ANTES** DE DAR PUSH.
-- O profile `prod` usa ddl-auto=validate.
--
-- Selecione o banco (u..._ECONEXO) antes de executar.

-- ---------------------------------------------------------------------------
-- Até aqui não existia papel nenhum: /menu-user/administration era acessível
-- a QUALQUER usuário logado, bastando digitar a URL.
--
-- NOT NULL DEFAULT FALSE: ninguém vira administrador por acidente, e as
-- linhas já existentes entram como não-administradores.
--
-- Não há (e não deve haver) endpoint que promova alguém a administrador —
-- seria o caminho mais curto para escalar privilégio. A promoção é manual,
-- por SQL, por quem tem acesso ao banco.
-- ---------------------------------------------------------------------------
ALTER TABLE usuario
    ADD COLUMN admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Para tornar alguém administrador, rode com o e-mail correto:
--
--     UPDATE usuario SET admin = TRUE WHERE email = 'seu@email.com';
--
-- Para conferir quem é:
--
--     SELECT id_usuario, nome, email, admin FROM usuario WHERE admin = TRUE;
