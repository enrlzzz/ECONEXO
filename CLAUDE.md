# CLAUDE.md — Regras do projeto EcoNexo

Instruções permanentes para qualquer pessoa (ou IA) que for escrever código aqui.
**Este repositório é público.** Trate tudo que entra num commit como publicado.

---

## 1. Piso de versões — NÃO REGREDIR

O scanner da Hostinger apontou 21 CVEs nas dependências do frontend em agosto/2026.
As versões abaixo são **piso mínimo**. Baixar qualquer uma delas reabre uma
vulnerabilidade já conhecida e é considerado regressão — não passa em review.

| Pacote | Versão mínima | Por quê |
|---|---|---|
| `react-router-dom` / `react-router` | **7.18.2** | Open redirect via backslash em `<Link>`/`useNavigate`, DoS em route matching, CSRF em PUT/PATCH/DELETE |
| `vite` | **8.2.1** | Bypass de `server.fs.deny` em paths alternativos do Windows; NTLMv2 hash disclosure via `launch-editor` |
| `postcss` | **8.5.23** | Path traversal via `sourceMappingURL` → leitura arbitrária de `.map` |
| `nanoid` | **3.3.17** | Loop infinito com size zero/negativo |
| `js-yaml` | **4.3.1** | Consumo quadrático de CPU em `!!omap` e merge keys |
| `brace-expansion` | **1.1.18** | DoS por expansão ilimitada → OOM |
| `@babel/core` | **7.29.6** | Leitura arbitrária de arquivo via comentário `sourceMappingURL` |

`postcss`, `nanoid`, `js-yaml`, `brace-expansion` e `@babel/core` são **transitivas**
(vêm via `vite` e `eslint`). Se subir as diretas não resolver, force com `overrides`
no `package.json` — não deixe passar:

```json
"overrides": {
  "postcss": ">=8.5.23",
  "nanoid": ">=3.3.17",
  "js-yaml": ">=4.3.1",
  "brace-expansion": ">=1.1.18",
  "@babel/core": ">=7.29.6"
}
```

**Antes de qualquer PR que mexa em dependências:** rode `npm audit` no `frontend/`
e confirme que não subiu a contagem.

---

## 2. Regras de segurança que não se negociam

Escritas como regra permanente porque cada uma delas já foi um problema real aqui.

1. **Senha nunca em texto puro.** Só BCrypt (`PasswordEncoder`). Nada de
   `senha.equals(outra)`.
2. **Senha nunca na URL.** Credencial vai no corpo da requisição, sempre. Query
   string aparece em log de servidor, de proxy e no histórico do navegador.
3. **Entidade JPA nunca é devolvida pela API.** Todo endpoint responde com DTO.
   `senha` e `cpf` não existem em nenhuma resposta, em nenhum endpoint, nunca.
4. **Todo endpoint sob `/api/**` exige autenticação**, exceto `login` e `cadastro`.
5. **Guard de rota no React não é segurança** — é conveniência de UX. Quem autoriza
   é o backend. `localStorage` é editável pelo usuário em 5 segundos no DevTools.
6. **Toda escrita/leitura de recurso de usuário confere dono.** O id vem do token,
   nunca só do path — senão qualquer um edita o registro de qualquer outro.
7. **Conexão com banco sempre com TLS** quando sair da máquina local.
8. **Nenhum segredo em commit.** Credencial de produção vive em variável de
   ambiente no painel (Render/Hostinger). Se vazar uma, rotacione — não basta apagar
   o commit, o histórico do Git guarda.
9. **Erro não vaza stack trace.** `@ControllerAdvice` devolve JSON padronizado.
10. **Rate limit em `login` e `cadastro`:** 10 tentativas, bloqueio de 15 min.

---

## 3. Deploy

Arquitetura: **name.com (DNS) → Hostinger (frontend + MySQL) + Render (backend)**.
Passo a passo em [`deploy/HOSTINGER-RENDER.md`](deploy/HOSTINGER-RENDER.md).

- `git push` na `main` atualiza frontend e backend **automaticamente**.
- **Mudança de schema é manual e vem ANTES do push:** aplique o SQL no phpMyAdmin
  da Hostinger primeiro. O profile `prod` usa `ddl-auto=validate` e o backend se
  recusa a subir se as entidades não baterem com as tabelas. Isso é proposital.
- Credenciais de banco: só no painel do Render, como `sync: false` no `render.yaml`.
- A Hostinger roda **MariaDB**, não MySQL Oracle. O warning `HHH000339 / Unknown
  column 'RESERVED'` no log é benigno e esperado.

## 4. Convenções

- **Monorepo:** `backend/` (Spring Boot 3.4 / Java 21), `frontend/` (React 19 + Vite),
  `database/`, `deploy/`.
- `database/schema.sql` **não** contém `CREATE DATABASE` nem `USE` — quem importa
  escolhe o banco. Não readicione: quebra o import na Hostinger.
- Branch por task (`feat/busca-api`), PR com 1 aprovação. `main` sempre deployável.
- Definition of Done: roda local + PR aprovado + **sem segredo no código** + card movido.
