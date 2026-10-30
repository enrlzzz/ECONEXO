# EcoNexo — frontend

React 19 + Vite. Login pelo Firebase Authentication; o resto da API no backend Spring.

```sh
npm install
cp .env.example .env.local   # preencha a config do Firebase
npm run dev                  # http://localhost:5173
npm run build && npm run lint
```

- Configuração do Firebase, emulador local e migração de contas antigas: veja a
  seção **4. Login** do [`README.md`](../README.md) da raiz.
- Sistema visual (tokens, componentes, regras): [`CLAUDE.md`](../CLAUDE.md), seção 4,
  e o protótipo aprovado em [`prototipo.html`](../prototipo.html).
- Antes de mexer em dependências: `npm audit` não pode subir (CLAUDE.md, seção 1).
