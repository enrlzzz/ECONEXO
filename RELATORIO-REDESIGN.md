# Relatório — Redesign, login com Firebase, carrossel e perfil (out/2026)

## O que mudou

| Área | Mudança |
|---|---|
| Sistema visual | Tokens novos (`variables.css`): galeria branca + faixas `#f5f5f7`, Inter, cards 28px sem sombra/gradiente, botões pill, verde fotovoltaico `#0a7f4f` como única cor de ação. Os nomes antigos dos tokens foram mantidos, então **todas** as telas (inclusive a área logada) mudaram juntas. Varredura nas folhas da área logada tirou sombras, gradientes, azul antigo e Montserrat. |
| Páginas públicas | Navegação e rodapé novos; home redesenhada; `/analisar` virou página própria; entrar, criar conta, **recuperar senha** e **concluir cadastro** (Google) novas. |
| Área logada | Barra de navegação nova (mesma linguagem da pública); menu de perfil novo. Conteúdo das telas preservado — só estilo. |
| Login | Firebase Authentication (e-mail/senha, Google, logout, recuperação, sessão persistente). O front não chama mais `/api/auth/login` nem `/api/usuarios` para entrar/cadastrar. |
| Backend | Valida o ID token do Firebase (assinatura do Google, `iss`/`aud`); `POST /api/auth/firebase` acha/vincula/cria o cadastro (vínculo de conta antiga só com e-mail verificado; cadastro novo exige LGPD). JWT antigo continua aceito na transição — nada foi apagado. |
| Análise | Pública (visitante analisa sem salvar). O Gemini agora devolve JSON com números por mês; logado → salvo em `analise_conta`. |
| Perfil | `/perfil`: total de análises, consumo e valor médios, última análise, tendência, lista e detalhe (com excluir). Estados carregando, erro e vazio. |
| Carrossel | 3 slides (bateria, crescimento Brasil/Sorocaba, limpeza da placa) com fonte, data e link em cada um. |

Arquivos principais: `frontend/src/variables.css`, `components.css`, `auth/`, `components/{header,footer,layout,main,carrossel,analisar,perfil,login,cadastro,recuperar-senha,concluir-cadastro}`, `components/main/economia-analise/`; backend `security/FirebaseTokenService.java`, `controller/{AuthController,EconomiaController}.java`, `service/{UsuarioService,EconomiaService,AnaliseContaService}.java`; `database/migrations/V7__firebase_uid_e_historico_de_analises.sql`.

## Novas dependências

- `firebase@13.0.0` (front) — SDK oficial; só `firebase/app` e `firebase/auth` são importados.
- `spring-security-oauth2-jose` (back, versão do Spring Boot) — valida o JWT do Firebase sem Admin SDK nem conta de serviço.
- `npm audit`: **0 vulnerabilidades** (o firebase trouxe `@grpc/grpc-js` vulnerável → override; aproveitei para fechar 4 altas que já existiam: vite, brace-expansion, source-map-js, zod). Pisos atualizados no CLAUDE.md.

## QA

| Item | Status | Como |
|---|---|---|
| Visitante analisa sem salvar | **Testado** | Playwright, backend simulado |
| Cadastro (senhas diferentes, LGPD obrigatória, vínculo com ID token) | **Testado** | Playwright + emulador do Firebase Auth |
| Login, senha errada (mensagem pt-BR), logout, sessão persistente | **Testado** | idem |
| Recuperar senha | **Testado** | emulador (o e-mail real não foi enviado) |
| Logado analisa → histórico no /perfil → detalhe | **Testado** | Playwright, backend simulado |
| Rota protegida redireciona | **Testado** | idem |
| Google | **Criado** | não testável sem projeto real |
| Backend: vínculo, LGPD 428, e-mail não verificado 409, histórico só do dono, análise pública | **Testado** | 6 testes novos + 30 antigos passando (`mvn test`) |
| Carrossel: 3 s, pausa (botão/mouse/foco), teclado, reduced-motion, fontes nos 3 slides | **Testado** | Playwright |
| Responsividade 360/390 e 1280 sem rolagem horizontal | **Testado** | 28 telas fotografadas (320 e 768 só no protótipo) |
| Contraste AA | **Validado** (cálculo) | verde 5,05:1, link 5,85:1, âmbar 5,72:1, texto secundário 5,07:1 |
| Foco visível | **Inspecionado** | anel verde global de 2px |
| Console sem erros | **Testado** | nas telas e fluxos acima |
| Build | **Testado** | `vite build` ok |
| Lint | **Testado** | 1 erro pré-existente em `pontos-recarga` (não mexi) |
| Ortografia pt-BR | **Inspecionado** | revisão manual dos textos novos |
| Nenhuma chave no repositório | **Testado** | `git grep` por padrões de chave; `.env`/`.env.local` ignorados |

## Antes do deploy (ordem importa)

1. Criar o projeto no Firebase e ativar e-mail/senha + Google; autorizar `econexo.dev` (README, seção 4).
2. Hostinger (build do front): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
3. Render: `FIREBASE_PROJECT_ID` (o mesmo projectId).
4. phpMyAdmin: rodar `V7__firebase_uid_e_historico_de_analises.sql` **antes** do push na `main`.

## Limitações e pendências

- **Contas antigas** precisam "criar conta" de novo com o mesmo e-mail e confirmar o link; aí o cadastro antigo é vinculado. Senhas antigas não migram (estão em BCrypt, o Firebase não importa sem o hash bruto exportado).
- **Análise sem limite** (decisão do produto). Um script pode consumir a cota do Gemini; se virar problema, o ponto para um limite por IP está comentado no `EconomiaController`.
- Números por mês dependem da leitura da IA; quando ela não acha um dado, aparece “—”.
- Sorocaba: dado de frota (Detran-SP via jornal), não de vendas; não há série municipal oficial.
- O bundle principal cresceu ~130 kB (Firebase Auth). Dá para carregar o Auth sob demanda depois.
- As telas internas mantêm a estrutura antiga; ganharam o sistema visual, não um redesenho de layout tela a tela.

## Obsoletos (não apaguei — decisão sua)

- `frontend/src/components/cadastro/index.css` (o cadastro usa `login/index.css`)
- `frontend/src/assets/hero-projeto-eletrico.jpg`, `frontend/src/assets/lightning.png`
- Backend: `POST /api/auth/login`, `JwtService` e `JWT_SECRET` — ainda aceitos; podem sair quando todas as contas estiverem no Firebase.
- `usuariosService.login` / `criar` em `frontend/src/services/usuarios.js` — o front não usa mais.
