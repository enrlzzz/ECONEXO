import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./reset.css";
import "./variables.css";
import "./animations.css";
import "./components.css";
import App from "./App.jsx";
import Cadastro from "./components/cadastro/index.jsx";
import Login from "./components/login/index.jsx";
import InterfaceUser from "./components/interface-user/index.jsx";
import TimelineInterface from "./components/interface-user/timeline-interface/index.jsx";
import ProjectInterface from "./components/interface-user/project-interface/index.jsx";
import MessageInterface from "./components/interface-user/message-interface/index.jsx";
import NotificationInterface from "./components/interface-user/notification-interface/index.jsx";
import PortfolioInterface from "./components/interface-user/portfolio-interface/index.jsx";
import ValidacaoInterface from "./components/interface-user/validacao-interface/index.jsx";
import ReputacaoInterface from "./components/interface-user/reputacao-interface/index.jsx";
import Search from "./components/interface-user/search-interface/index.jsx";
import Profile from "./components/interface-user/profile-interface/index.jsx";
import Settings from "./components/interface-user/settings-interface/index.jsx";
import Administration from "./components/interface-user/administration-interface/index.jsx";
import PontosRecarga from "./components/interface-user/pontos-recarga/index.jsx";
import PoliticaPrivacidade from "./components/politica-privacidade/index.jsx";
import Analisar from "./components/analisar/index.jsx";
import Perfil from "./components/perfil/index.jsx";
import DetalheAnalise from "./components/perfil/DetalheAnalise.jsx";
import RecuperarSenha from "./components/recuperar-senha/index.jsx";
import ConcluirCadastro from "./components/concluir-cadastro/index.jsx";
import { observarSessao } from "./auth/sessao";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AdminRoute from "./components/auth/AdminRoute.jsx";

const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },

  {
    path: "/register",
    element: <Cadastro />,
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/recuperar-senha",
    element: <RecuperarSenha />,
  },

  {
    // Primeira entrada com Google: falta nome e consentimento LGPD.
    path: "/concluir-cadastro",
    element: <ConcluirCadastro />,
  },

  {
    // Pública: visitante analisa sem conta (nada é salvo).
    path: "/analisar",
    element: <Analisar />,
  },

  {
    // Painel das contas analisadas — a única rota nova que exige login.
    path: "/perfil",
    element: protect(<Perfil />),
  },

  {
    path: "/perfil/analise/:id",
    element: protect(<DetalheAnalise />),
  },

  // Pública de propósito: a LGPD (Art. 9º) exige acesso facilitado à
  // informação sobre o tratamento — não dá para exigir login para lê-la.
  {
    path: "/politica-de-privacidade",
    element: <PoliticaPrivacidade />,
  },

  {
    // Home social — timeline da comunidade
    path: "/menu-user",
    element: protect(<TimelineInterface />),
  },

  {
    // Dashboard antigo (cards, progresso, projetos recentes)
    path: "/menu-user/painel",
    element: protect(<InterfaceUser />),
  },

  {
    path: "/menu-user/projects",
    element: protect(<ProjectInterface />),
  },

  {
    path: "/menu-user/messages",
    element: protect(<MessageInterface />),
  },

  {
    path: "/menu-user/notifications",
    element: protect(<NotificationInterface />),
  },

  {
    path: "/menu-user/portfolio",
    element: protect(<PortfolioInterface />),
  },

  {
    path: "/menu-user/buscar",
    element: protect(<Search />),
  },

  // Os dois modulos de confianca. Rotas separadas em vez das abas locais
  // do prototipo: o link vira compartilhavel e o botao "voltar" funciona.
  {
    path: "/menu-user/validacao",
    element: protect(<ValidacaoInterface />),
  },

  {
    path: "/menu-user/reputacao",
    element: protect(<ReputacaoInterface />),
  },

  {
    path: "/menu-user/profile",
    element: protect(<Profile />),
  },

  {
    path: "/menu-user/settings",
    element: protect(<Settings />),
  },

  {
    path: "/menu-user/pontos-recarga",
    element: protect(<PontosRecarga />),
  },

  {
    // Exige a flag `admin`. Antes bastava estar logado e digitar a URL.
    path: "/menu-user/administration",
    element: (
      <AdminRoute>
        <Administration />
      </AdminRoute>
    ),
  },
]);

// Se a sessão do Firebase acabar (expirou, saiu em outra aba), o cache da
// interface é limpo e as rotas protegidas voltam para /login.
observarSessao();

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
