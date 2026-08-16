# Deploy EcoNexo — Hostinger + Render + name.com

Arquitetura de produção **com deploy automático**: todo push na `main` atualiza
frontend e backend sozinho.

```
                        name.com (registrador do domínio)
                                    │
                         nameservers apontam p/ Hostinger
                                    │
                                    ▼
        ┌───────────────────────────────────────────────┐
        │              HOSTINGER (hPanel)               │
        │                                               │
        │   seudominio.com ──► public_html/             │
        │                      (build do React/Vite)    │
        │                                               │
        │   MySQL 8 ◄── Remote MySQL habilitado         │
        └───────────────────────────────────────────────┘
                     ▲                        ▲
        fetch HTTPS  │                        │ JDBC :3306
                     │                        │
        ┌────────────┴────────────────────────┴─────────┐
        │            RENDER.COM (free tier)             │
        │   econexo-api.onrender.com                    │
        │   Spring Boot 3.4 / Java 21 (Docker)          │
        └───────────────────────────────────────────────┘

        GitHub (enrlzzz/ECONEXO) ──► dispara build nos DOIS
```

**Pré-requisito:** plano Hostinger **Business** ou **Cloud** (Premium e Single
não têm o recurso de Node.js App que roda o `npm run build`).

---

## 1. DNS — apontar o domínio do name.com para a Hostinger

1. No **hPanel** da Hostinger: *Websites → Adicionar site → Usar domínio existente*.
   Digite seu domínio. A Hostinger vai exibir os **nameservers** dela
   (normalmente `ns1.dns-parking.com` e `ns2.dns-parking.com`) — **copie os que ela mostrar**.
2. No **name.com**: *My Domains → seu domínio → Nameservers → Manage Nameservers*.
   Apague os nameservers do name.com e cole os da Hostinger.
3. Salve.

> A propagação leva de 30 min a 24 h. **Faça este passo primeiro** e siga para os
> outros enquanto propaga — é o único passo que depende de tempo de espera.

Conferir se propagou:
```sh
nslookup -type=NS seudominio.com
```

---

## 2. MySQL na Hostinger

### 2.1 Criar o banco

hPanel → *Databases → Management → Create a New Database*.

A Hostinger **prefixa tudo** com o ID da sua conta (algo como `u645824401_`).
Anote os 4 valores reais — eles vão ser pedidos no Render:

| Campo | Onde achar |
|---|---|
| Database | `<SEU_BANCO>` — *Databases → Management*, coluna do banco |
| Usuário | `<SEU_USUARIO>` — *Databases → Management*, coluna do usuário. **Não é igual ao nome do banco** |
| Senha | a que você definir ao criar |
| Host | ⚠️ **não é `localhost`** — o painel mostra `localhost` porque assume acesso interno. Para o Render você precisa do hostname/IP externo, que aparece em *Remote MySQL* (passo 2.3) |

> 🚨 **Os dois erros que custam mais tempo aqui**, ambos já aconteceram neste projeto:
> 1. Pôr o **nome do banco** no campo `DB_HOST` → `UnknownHostException: Name does not resolve`
> 2. Copiar um **valor de exemplo** de documentação em vez do seu → `Access denied for user`
>
> Copie sempre do painel, nunca de um guia.

### 2.2 Carregar o schema

`database/schema.sql` já está pronto para importar direto — ele **não** contém
`CREATE DATABASE` nem `USE` (que fariam o phpMyAdmin falhar na linha 1, já que em
hospedagem compartilhada a conta não pode criar databases e o nome vem prefixado).

hPanel → *phpMyAdmin* → selecione `<SEU_BANCO>` no menu da esquerda → aba
**Importar** → escolha `database/schema.sql` → *Executar*.

> ⚠️ **Selecione o banco antes de importar.** Como o arquivo não tem `USE`, se você
> importar sem nada selecionado as tabelas vão para o lugar errado.

Confira que criou as 8 tabelas: `usuario`, `skill`, `usuario_skill`, `endereco`,
`formacao`, `projeto`, `projeto_participante`, `avaliacao`.

> Toda vez que o schema mudar (ex.: `tipo_conta` na Sprint 1, `certificado` na
> Sprint 2) esse import é refeito à mão. Quando o time adotar Flyway (task 0.6 do
> plano), o passo desaparece.

### 2.3 Liberar acesso remoto

O backend roda no Render, fora da Hostinger — sem isto ele não enxerga o banco.

hPanel → *Databases → Remote MySQL*:
- Marque **“Any Host”** (`%`)
- Selecione o database `<SEU_BANCO>`
- Anote o **hostname/IP remoto** que aparecer — é o seu `DB_HOST`

> **Por que “Any Host”:** o free tier do Render não dá IP de saída fixo, então não
> existe IP para colocar na whitelist. É o ponto mais frágil desta arquitetura e
> está registrado como dívida técnica — quando houver JWT e orçamento para um
> plano pago com IP estático, troque por whitelist.

---

## 3. Backend no Render

1. [render.com](https://render.com) → *New → Blueprint* → conecte o repo `enrlzzz/ECONEXO`.
2. O Render lê o [`render.yaml`](../render.yaml) da raiz e já cria o serviço
   `econexo-api` com Docker, região Oregon e plano free.
3. Ele vai **pedir os valores marcados como `sync: false`**. Preencha com o que
   você anotou no passo 2:

| Variável | Valor |
|---|---|
| `DB_HOST` | hostname remoto do MySQL da Hostinger |
| `DB_NAME` | `<SEU_BANCO>` |
| `DB_USER` | `<SEU_USUARIO>` |
| `DB_PASS` | a senha do banco |
| `APP_ALLOWED_ORIGINS` | `https://seudominio.com,https://www.seudominio.com` |
| `JWT_SECRET` | **mínimo 32 caracteres.** Gere com `openssl rand -base64 48` — ou deixe o Render sortear (`generateValue`) |

   (`SPRING_PROFILES_ACTIVE=prod` e `DB_PORT=3306` já vêm preenchidos.)

> ⚠️ **Sem `JWT_SECRET` o backend não sobe** — e isso é proposital. Uma chave
> ausente ou curta tornaria os tokens forjáveis, ou seja, autenticação
> decorativa. Melhor falhar no deploy do que subir com login que não protege nada.
>
> Trocar a chave depois invalida todos os tokens em circulação: todo mundo
> precisa entrar de novo. Isso é justamente o botão de emergência caso ela vaze.

4. *Create* → o primeiro build leva ~5 min (compila o JAR dentro do container).

Testar:
```sh
curl https://econexo-api.onrender.com/api/skills     # deve retornar []
```

> **Free tier hiberna** após 15 min sem tráfego; a primeira chamada depois disso
> demora ~50 s. Para a demo de novembro, abra o site 1 min antes de apresentar.

---

## 4. Frontend na Hostinger

hPanel → *Websites → seu site → Node.js App* (ou *Deployment*) → **Import Git repository**:

1. *Connect with GitHub* → instale o app da Hostinger → autorize `enrlzzz/ECONEXO`.
2. Configure — **este é um monorepo, então os defaults não servem**:

| Campo | Valor |
|---|---|
| Branch | `main` |
| Framework preset | Vite (ou *Static*) |
| Node.js version | 22 |
| Package manager | npm |
| Build command | `cd frontend && npm ci && npm run build` |
| Output directory | `frontend/dist` |
| Entry file | *(vazio — é site estático, não servidor)* |

3. *Deploy*. A partir daí, **todo push na `main` dispara rebuild automático**.

O `.htaccess` que fica em `frontend/public/` é copiado para o `dist/` no build e
vai junto — é ele que faz as 12 rotas do react-router funcionarem no F5.

---

## 5. HTTPS

hPanel → *Segurança → SSL* → instalar o certificado gratuito no domínio e ativar
**Force HTTPS**.

Só depois disso o `APP_ALLOWED_ORIGINS` do Render (que está em `https://`) vai bater
com a origem real das requisições.

---

## 6. Verificação final

```sh
curl -I https://seudominio.com                    # 200 + cadeado
curl https://econexo-api.onrender.com/api/skills  # []
```

No navegador, com o DevTools aberto (aba Network):

1. Abrir `https://seudominio.com` → carrega a landing
2. **Dar F5 em `https://seudominio.com/login`** → tem que carregar, não 404
   *(se der 404, o `.htaccess` não subiu)*
3. Fazer um cadastro → request para `econexo-api.onrender.com` retorna 200
   *(se der erro de CORS, revise `APP_ALLOWED_ORIGINS` no Render)*

---

## 7. Deploy de novas versões

Não tem passo manual. `git push origin main` atualiza os dois:

- **Hostinger** detecta o push → roda o build → publica no `public_html`
- **Render** detecta o push → rebuilda o container → reinicia a API

Mudou o schema do banco? Aí sim é manual: importe o SQL novo pelo phpMyAdmin
(seção 2.2) **antes** do push, senão o backend não sobe — o profile `prod` usa
`ddl-auto=validate`, que recusa iniciar se as entidades JPA não baterem com as
tabelas. É proposital: evita que o Hibernate altere o banco de produção sozinho.

---

## Troubleshooting

| Sintoma | Causa provável |
|---|---|
| 404 ao dar F5 em `/menu-user/buscar` | `.htaccess` não chegou no `public_html` — confira o *Output directory* |
| Erro de CORS no console | `APP_ALLOWED_ORIGINS` no Render sem o domínio exato (com `https://`, sem barra no fim) |
| Front carrega mas API não responde | `VITE_API_URL` em `frontend/.env.production` apontando para o lugar errado |
| Primeira chamada demora ~50 s | Normal: free tier do Render hibernando |
| Backend não inicia — `Schema-validation: missing table` | Schema não importado, ou importado no database errado |
| Backend não inicia — `Access denied for user` | `DB_USER`/`DB_PASS` errados, ou Remote MySQL não habilitado |
| Backend não inicia — `Communications link failure` | Remote MySQL sem “Any Host” marcado |
| Backend não inicia — `UnknownHostException: Name does not resolve` | `DB_HOST` recebeu o **nome do banco** em vez do hostname do servidor |
| Build da Hostinger falha em `npm ci` | *Build command* com `cd frontend` **junto** com diretório raiz `frontend` — use um ou outro, não os dois |
| Build da Hostinger falha em `npm ci` com *lock file out of sync* | Alguém editou `package.json` sem rodar `npm install`; rode e commite o lock |

### Avisos benignos no log do Render (pode ignorar)

```
HHH000339: Could not obtain connection metadata:
           SQLSyntaxErrorException: Unknown column 'RESERVED' in 'WHERE'
HHH90000025: MySQLDialect does not need to be specified explicitly
```

O primeiro revela que a Hostinger roda **MariaDB**, não MySQL Oracle: o driver
consulta `INFORMATION_SCHEMA.KEYWORDS.RESERVED`, coluna que só existe no MySQL.
Como o MariaDB é compatível no protocolo e no SQL que usamos, tudo funciona — o
efeito é só o Hibernate logar `Database driver: undefined/unknown`.

O segundo é a dialect declarada à mão em `application.properties`, que o
Hibernate 6 já detecta sozinho.

Nenhum dos dois impede o boot. Se um dia forem incomodar, a correção é trocar a
dialect por `MariaDBDialect` — ou simplesmente remover a linha e deixar a
detecção automática agir.

---

## Sobre o `DEPLOY.md`

O arquivo [`DEPLOY.md`](DEPLOY.md) ao lado descreve a arquitetura **de VPS**
(tudo numa máquina só, com nginx + systemd + Let's Encrypt). Ele **não se aplica**
a esta configuração — está mantido como referência caso o projeto migre para VPS
no futuro. Para o deploy atual, use **este** arquivo.
