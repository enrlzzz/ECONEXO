# Continuação do projeto — guia para o Bertocco

Oi, Bertocco! Este arquivo explica de onde você pega o EcoNexo, o que já está
pronto e o que falta. Leia também o [`CLAUDE.md`](CLAUDE.md): são as regras
permanentes do projeto (segurança, versões mínimas, deploy).

---

## 0. Onde está o trabalho

| | |
|---|---|
| **Pull request** | **#4 — "Redesign do sistema, login com Firebase, carrossel educativo e histórico de análises"** → https://github.com/enrlzzz/ECONEXO/pull/4 |
| **Branch** | `claude/nice-wozniak-jhv836` (base: `main`) |
| **Estado** | Rascunho (draft). CI verde, sem conflitos. **Ainda não foi para produção.** |
| **Preview** | A Hostinger publica um preview a cada push — o link fica no comentário do bot no PR. |
| **Relatório completo** | [`RELATORIO-REDESIGN.md`](RELATORIO-REDESIGN.md) (o que mudou, testes, pendências) |
| **Protótipo aprovado** | [`prototipo.html`](prototipo.html) — abre com duplo clique |

Para continuar na mesma branch:

```bash
git fetch origin
git checkout claude/nice-wozniak-jhv836
```

> ⚠️ `git push` na `main` faz deploy automático (front na Hostinger, back no Render).
> Só faça o merge do PR #4 depois dos passos 1, 2 e 3 abaixo.

---

## Contexto geral

- **EcoNexo**: marketplace de instaladores solares certificados (Startup: Project
  One, Facens, Equipe Lunitec). Site: `econexo.dev`. Vitrine em novembro/2026.
- **Arquitetura**: front React 19 + Vite na **Hostinger**; back Spring Boot 3.4 /
  Java 21 no **Render** (plano grátis — dorme após ~15 min parado); banco
  MariaDB na Hostinger.
- **O que o PR #4 traz**:
  1. **Redesign do sistema todo** — visual "galeria branca" (verde `#0a7f4f`, Inter,
     cards de 28px sem sombra). Tokens em `frontend/src/variables.css`.
  2. **Login pelo Firebase Authentication** (e-mail/senha, Google, recuperar senha).
     O back valida o token do Firebase e liga a conta ao cadastro dele.
  3. **Análise de conta de luz pública** (visitante analisa sem salvar) usando a
     **API do Groq**. Logado, a análise vai para o histórico em `/perfil`.
  4. **Carrossel educativo** e seção **"Nossa equipe"** na home.
- **Testes**: `mvn test` (39 testes) e `npm run build` / `npm run lint` no front.

---

## 1. Groq — chave para analisar as contas

A análise de contas usa o Groq (plano gratuito), modelo `openai/gpt-oss-120b`.

1. Entre em **https://console.groq.com/keys** (login com Google serve).
2. **Create API Key** → dê um nome (ex.: `econexo-render`) → copie a chave
   (começa com `gsk_`). Ela só aparece uma vez.
3. **Render** → serviço do backend → **Environment** → **Add Environment Variable**:
   - `GROQ_API_KEY` = a chave
   - (opcional) `GROQ_MODEL` = outro modelo, se o Groq aposentar o atual. Veja os
     modelos do plano grátis em https://console.groq.com/docs/models.
4. Salve. O Render reinicia o serviço sozinho.

**Regras:**
- A chave do Groq é **segredo**. Nunca coloque no Git, no `.env.production`, em
  print ou em mensagem. Se vazar, apague em console.groq.com/keys e crie outra.
- Sem a chave, o site funciona e a análise responde "Análise indisponível".
- Limite do plano grátis: se muita gente analisar ao mesmo tempo, a tela pede
  para "aguardar um minuto". Isso é esperado.
- Rodar local: `GROQ_API_KEY=gsk_... ./mvnw spring-boot:run` dentro de `backend/`.

Código: `backend/src/main/java/com/econexo/service/EconomiaService.java`.

---

## 2. Firebase — criar o projeto

> **Esclarecendo o objetivo:** o Firebase aqui é **só para o login**
> (Authentication). Ele **não** acelera o backend. A demora que a gente vê é o
> Render grátis "acordando" (até ~1 min depois de parado). O que ajuda nisso é o
> workflow `keep-alive.yml` (já existe) ou um plano pago no Render. O que o
> Firebase melhora: senha, Google, recuperação de senha e segurança da conta,
> sem a gente guardar senha.

### Passo a passo

1. **https://console.firebase.google.com** → **Adicionar projeto** → nome
   `econexo` (Google Analytics é opcional; pode desativar).
2. **Build → Authentication → Começar**. Na aba **Método de login**, ative:
   - **E-mail/senha**
   - **Google** (escolha o e-mail de suporte)
3. **Authentication → Configurações → Domínios autorizados**: adicione
   `econexo.dev`, `www.econexo.dev` e o domínio do preview da Hostinger, se
   quiser testar lá. `localhost` já vem.
4. **Engrenagem → Configurações do projeto → Seus apps → `</>` (Web)** →
   registre o app `econexo-web` (sem Hosting). Copie os valores do `firebaseConfig`.
5. Coloque os valores em **`frontend/.env.production`**. É o arquivo que o build
   da Hostinger lê, e pode ir para o Git:
   ```
   VITE_FIREBASE_API_KEY=...        (apiKey)
   VITE_FIREBASE_AUTH_DOMAIN=...    (authDomain)
   VITE_FIREBASE_PROJECT_ID=...     (projectId)
   VITE_FIREBASE_APP_ID=...         (appId)
   ```
   A config web do Firebase **não é segredo**: ela vai para o JavaScript público
   de qualquer jeito. A proteção é o passo 3 (domínios) e o backend só aceitar
   token deste projeto.
6. **Render → Environment**: `FIREBASE_PROJECT_ID` = o mesmo `projectId` do passo 5.
7. Para rodar local, copie `frontend/.env.example` para `frontend/.env.local` e
   preencha com os mesmos valores. O `.env.local` não vai para o Git.

**Testar sem projeto real (emulador):**

```bash
npx firebase-tools emulators:start --only auth --project demo-econexo
```

Depois, no `frontend/.env.local`, use `VITE_FIREBASE_PROJECT_ID=demo-econexo` e
`VITE_FIREBASE_AUTH_EMULATOR=http://127.0.0.1:9099`. Isso só vale no `npm run dev`.

---

## 3. Antes de fazer o merge do PR #4 (ordem importa)

1. Passos 1 e 2 feitos (Groq e Firebase configurados).
2. **phpMyAdmin da Hostinger** → selecione o banco → aba SQL → rode
   `database/migrations/V7__firebase_uid_e_historico_de_analises.sql`.
   **Tem que ser antes do merge:** o backend em produção usa `ddl-auto=validate`
   e não sobe se a tabela `analise_conta` e a coluna `firebase_uid` não existirem.
3. Tire o PR de rascunho ("Ready for review"), revise e faça o merge.
4. Depois do deploy, teste em `econexo.dev`: criar conta, entrar, sair, recuperar
   senha, analisar duas contas logado e ver em `/perfil`.

**Contas antigas** (criadas antes do Firebase): a pessoa vai em "Criar conta" com
o **mesmo e-mail** e confirma pelo link que chega no e-mail. Assim o cadastro
antigo (projetos, avaliações, CREA) é recuperado.

---

## 4. O que ainda falta (onde paramos)

- [ ] Configurar Groq e Firebase (seções 1 e 2) e testar o login de verdade.
      O login com Google só foi testado no código, não com projeto real.
- [ ] Rodar a migração V7 e fazer o merge do PR #4.
- [ ] Seção "Nossa equipe": falta o link de LinkedIn/GitHub de cada um (campo
      `link` em `frontend/src/components/equipe/membros.js`; é opcional).
- [ ] Testes de usabilidade com usuários reais (meta da apresentação: 10).
- [ ] Decidir se a análise ganha um limite por IP. Hoje não tem limite, por
      decisão do Enrico; o lugar de pôr está comentado no `EconomiaController`.
- [ ] Arquivos obsoletos para decidir se apaga: lista no fim do `RELATORIO-REDESIGN.md`.
- [ ] Erro de lint que já existia em `frontend/src/components/interface-user/pontos-recarga/index.jsx`.

## 5. Comandos úteis

```bash
# backend
cd backend && ./mvnw test            # 39 testes (H2, não precisa de MySQL)
cd backend && ./mvnw spring-boot:run

# frontend
cd frontend && npm install && npm run dev   # http://localhost:5173
cd frontend && npm run build && npm run lint
cd frontend && npm audit                    # não pode aumentar (CLAUDE.md, seção 1)
```

Boa sorte! Qualquer dúvida sobre uma decisão, o histórico está no PR #4 e no
`RELATORIO-REDESIGN.md`.
