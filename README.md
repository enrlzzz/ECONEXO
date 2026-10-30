# EcoNexo

Plataforma de networking profissional e colaboração entre engenheiros e instaladores.

## Arquitetura

Monorepo com três módulos independentes:

```
ECONEXO/
├── backend/      Spring Boot 3.4 + JPA (Java 21) — porta 8080
├── frontend/     React 19 + Vite + react-router (porta 5173)
├── database/     schema.sql (MySQL 8)
├── deploy/       configs de produção (nginx, systemd, env, deploy guide)
└── docs/
```

### Spring profiles

- `dev` (default) — credenciais hard-coded em `application-dev.properties` (root/root local), CORS aberto, JPA `ddl-auto=update`, SQL logado.
- `prod` — credenciais lidas de variáveis de ambiente, CORS restrito a `APP_ALLOWED_ORIGINS`, JPA `ddl-auto=validate` (nunca altera schema).

Para rodar em prod localmente:
```sh
SPRING_PROFILES_ACTIVE=prod DB_USER=... DB_PASS=... APP_ALLOWED_ORIGINS=https://... ./mvnw spring-boot:run
```

## Pré-requisitos

| Ferramenta | Versão | Verificar com |
|---|---|---|
| Java JDK   | 21+    | `java -version` |
| Node.js    | 20+    | `node --version` |
| MySQL      | 8.x    | `mysql --version` |

Maven é incluído como wrapper (`backend/mvnw.cmd`), não precisa instalar global.

## Setup rápido

### 1. Banco de dados (MySQL)

Subir MySQL local e criar o schema:

```sh
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS Econexo"
mysql -u root -p Econexo < database/schema.sql
```

> `schema.sql` não cria nem seleciona o database — o banco é escolhido por quem
> importa. Isso permite que o mesmo arquivo sirva para dev, VPS e Hostinger
> (onde o nome do banco vem prefixado pelo painel).

Credenciais default (configuradas em `backend/src/main/resources/application.properties`):

- Host: `localhost:3306`
- Usuário: `root`
- Senha: `root`
- Database: `Econexo`

Para mudar, edite o arquivo acima (ou use variáveis de ambiente Spring Boot — ver seção abaixo).

### 2. Backend (Spring Boot)

```sh
cd backend
./mvnw spring-boot:run            # Linux/macOS
mvnw.cmd spring-boot:run          # Windows
```

API disponível em `http://localhost:8080/api/`. JPA com `ddl-auto=update` reconcilia o schema automaticamente na primeira execução.

### 3. Frontend (React + Vite)

```sh
cd frontend
npm install
npm run dev
```

Site em `http://localhost:5173`. As chamadas para `/api/*` são roteadas pelo proxy do Vite até `http://localhost:8080`.

### 4. Login (Firebase Authentication)

O login é feito pelo **Firebase Authentication** (e-mail/senha e Google). O
backend só valida o ID token e guarda o cadastro (nome, cidade, LGPD...).

1. [Console do Firebase](https://console.firebase.google.com) → criar projeto
   (Analytics é opcional).
2. **Authentication → Método de login**: ative **E-mail/senha** e **Google**.
3. **Authentication → Configurações → Domínios autorizados**: adicione
   `econexo.dev` (e `localhost` para desenvolvimento).
4. **Configurações do projeto → Seus apps → Web (`</>`)** → copie a config.
5. Produção: preencha `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
   `VITE_FIREBASE_PROJECT_ID` e `VITE_FIREBASE_APP_ID` em `frontend/.env.production`
   (é o arquivo que o build da Hostinger lê; pode ir para o Git — a config web do
   Firebase é pública por natureza). Local: as mesmas em `frontend/.env.local`.
6. Backend (Render): `FIREBASE_PROJECT_ID` = o mesmo `projectId`.
7. Banco: aplique `database/migrations/V7__firebase_uid_e_historico_de_analises.sql`
   no phpMyAdmin **antes** do push na `main`.

Sem a config, o site abre normalmente e só o login fica indisponível.

**Testar sem projeto real:** `npx firebase-tools emulators:start --only auth --project demo-econexo`
e, no `.env.local`, `VITE_FIREBASE_PROJECT_ID=demo-econexo` +
`VITE_FIREBASE_AUTH_EMULATOR=http://127.0.0.1:9099` (só vale em `npm run dev`).

**Contas antigas** (login anterior, senha no backend): a pessoa cria a conta de
novo em "Criar conta" com o **mesmo e-mail** e confirma pelo link enviado. Com o
e-mail confirmado, o cadastro antigo (projetos, avaliações, CREA) é vinculado.

## Endpoints principais

Públicos: `POST /api/auth/firebase`, `POST /api/economia/analisar`, `GET /health`
e os legados `POST /api/auth/login` e `POST /api/usuarios`.
**Todo o resto exige `Authorization: Bearer <ID token do Firebase>`.**

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/firebase` | ID token | Vincula/cria o cadastro da conta Firebase → `{usuario, novo}` (428 = falta nome/LGPD) |
| `POST` | `/api/economia/analisar` | pública | Análise de 2–6 contas; com token, salva no histórico |
| `GET`  | `/api/economia/historico` | Bearer | Histórico de análises do dono do token |
| `GET`/`DELETE` | `/api/economia/historico/{id}` | Bearer | Uma análise — só do dono |
| `POST` | `/api/auth/login` | pública | Legado (JWT próprio), mantido na transição |
| `POST` | `/api/usuarios` | pública | Cadastrar usuário (exige consentimento LGPD) |
| `GET`  | `/api/usuarios` | Bearer | Listar usuários |
| `GET`  | `/api/usuarios/{id}` | Bearer | Buscar por id |
| `PUT`  | `/api/usuarios/{id}` | Bearer | Editar — só o próprio cadastro |
| `DELETE` | `/api/usuarios/{id}` | Bearer | Excluir — só o próprio cadastro |
| `GET`/`POST` | `/api/skills` | Bearer | Skills |
| `GET`/`POST` | `/api/projetos` | Bearer | Projetos |
| `GET`/`POST` | `/api/formacoes` | Bearer | Formações |
| `GET`/`POST` | `/api/enderecos` | Bearer | Endereços |
| `GET`/`POST` | `/api/avaliacoes` | Bearer | Avaliações |
| `GET`  | `/health` | pública | Health check do keep-alive → `{"status":"ok"}` |

> ⚠️ **Credencial nunca vai na query string.** Esta tabela já documentou um
> `POST /api/usuarios/login?email=&senha=` que não existe mais: senha em URL
> aparece no log do servidor, no do proxy e no histórico do navegador. O login
> é `POST /api/auth/login` com as credenciais no corpo — regra 2 do
> [`CLAUDE.md`](CLAUDE.md), coberta pelo teste `loginPorQueryStringNaoFunciona`.

Erros seguem sempre `{status, erro, mensagem, campos?}` — nunca stack trace.
Nenhuma resposta, em nenhum endpoint, contém `senha` ou `cpf`.

### 5. Análise de contas (Groq)

A análise usa a API do **Groq** (plano gratuito), modelo `openai/gpt-oss-120b`.

1. Crie a chave em <https://console.groq.com/keys>.
2. **Render → serviço do backend → Environment:** `GROQ_API_KEY` = a chave.
   É segredo: nunca no Git, em `.env.production` ou em print.
3. Opcional: `GROQ_MODEL` para trocar o modelo se o Groq aposentá-lo
   (lista em <https://console.groq.com/docs/models>).
4. Local: `GROQ_API_KEY=... ./mvnw spring-boot:run`.

Sem a chave, o site funciona e a análise responde "indisponível".

## Customização de ambiente

### Backend — variáveis Spring (sobrescrevem `application.properties`)

```sh
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/Econexo
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
SERVER_PORT=8080
```

### Frontend — `.env.local` (não commitado)

Ver `frontend/.env.example` (API e Firebase).

## Deploy

Arquitetura de produção — **deploy automático a cada push na `main`**:

```
name.com (DNS) ──► Hostinger ──► public_html/  (build do React/Vite)
                        └──────► MySQL 8       (Remote MySQL habilitado)
                                    ▲
                                    │ JDBC
Render.com (free) ──► econexo-api.onrender.com  (Spring Boot em Docker)
```

👉 **[`deploy/HOSTINGER-RENDER.md`](deploy/HOSTINGER-RENDER.md)** — passo a passo completo.

Arquivos que sustentam esse deploy:

| Arquivo | Papel |
|---|---|
| [`render.yaml`](render.yaml) | Blueprint do Render — cria o serviço da API já configurado |
| [`backend/Dockerfile`](backend/Dockerfile) | Build do JAR em container (Render/Railway/Fly) |
| [`frontend/public/.htaccess`](frontend/public/.htaccess) | Fallback SPA no Apache da Hostinger (sem ele, F5 fora da home dá 404) |
| [`frontend/.env.production`](frontend/.env.production) | Aponta o front para a API no Render |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Build do backend + lint/build do frontend em cada PR |
| [`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml) | Ping periódico no `/health` para a instância do Render não dormir |

[`deploy/DEPLOY.md`](deploy/DEPLOY.md) descreve a alternativa em **VPS** (nginx + systemd + Let's Encrypt), mantida como referência caso o projeto migre.

## Observações de infraestrutura

**O backend roda no plano gratuito do Render.** Esse plano suspende a instância
depois de ~15 minutos sem tráfego. A requisição seguinte precisa esperar a
máquina subir de novo e a JVM/Spring bootar: na prática, **70 a 90 segundos** —
tempo suficiente para o login parecer travado para quem está testando o site.

Como mitigação existe o workflow
[`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml): a cada
12 minutos ele faz um `GET https://econexo-api.onrender.com/health`, mantendo a
instância acordada. Também dá para disparar na mão pela aba **Actions**
(`Run workflow`) — útil para aquecer o backend minutos antes de uma
apresentação. Se o ping falhar, o job termina em erro e a Action fica vermelha,
o que serve de alerta de que a API caiu de verdade.

Duas ressalvas honestas sobre isso:

- **É paliativo, não solução.** Manter a instância acordada artificialmente
  contorna o sintoma. A correção real é um plano pago do Render (ou qualquer
  host sem *sleep* automático), onde o serviço simplesmente não é suspenso.
  O keep-alive existe porque este é um projeto de faculdade em vitrine, e um
  login de 90 segundos inviabiliza a demonstração.
- **O cron do GitHub Actions não é pontual.** Em horário de pico o agendador
  atrasa, e crons frequentes são os primeiros a sofrer. Se aparecerem intervalos
  acima de 15 minutos entre execuções, baixe o cron para `*/10 * * * *`.

O endpoint `GET /health` responde `{"status":"ok"}` sem consultar o banco e sem
exigir autenticação. Ele fica **fora** de `/api/**` de propósito: a regra 4 do
[`CLAUDE.md`](CLAUDE.md) exige token em todo `/api/**` (exceto login e cadastro),
e abrir uma exceção ali só para o ping enfraqueceria a regra.
