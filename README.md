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

## Endpoints principais

Só `POST /api/auth/login`, `POST /api/usuarios` e `GET /health` são públicos.
**Todo o resto exige `Authorization: Bearer <token>`.**

| Método | Path | Auth | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | pública | Login — `{email, senha}` **no corpo** → `{token, expiraEmSegundos, usuario}` |
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

## Customização de ambiente

### Backend — variáveis Spring (sobrescrevem `application.properties`)

```sh
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/Econexo
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
SERVER_PORT=8080
```

### Frontend — `.env.local` (não commitado)

```
VITE_API_URL=http://localhost:8080
```

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
