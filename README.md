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

| Método | Path | Descrição |
|---|---|---|
| `POST` | `/api/usuarios` | Cadastrar usuário |
| `POST` | `/api/usuarios/login?email=&senha=` | Login |
| `GET`  | `/api/usuarios` | Listar usuários |
| `GET`  | `/api/usuarios/{id}` | Buscar por id |
| `GET`  | `/api/skills` | Listar skills |
| `GET`  | `/api/projetos` | Listar projetos |

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

[`deploy/DEPLOY.md`](deploy/DEPLOY.md) descreve a alternativa em **VPS** (nginx + systemd + Let's Encrypt), mantida como referência caso o projeto migre.
