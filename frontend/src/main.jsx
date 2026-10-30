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
import AreaLogada from "./components/layout/AreaLogada.jsx";


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

  // Pública de propósito: a LGPD (Art. 9º) exige acesso facilitado à
  // informação sobre o tratamento — não dá para exigir login para lê-la.
  {
    path: "/politica-de-privacidade",
    element: <PoliticaPrivacidade />,
  },

  // Área logada. O layout AreaLogada desenha cabeçalho e barra inferior uma
  // vez só para todas as telas, e o ProtectedRoute protege o grupo inteiro.
  // /menu-user/painel é o dashboard antigo (cards, progresso, projetos);
  // /menu-user/administration exige a flag admin (antes bastava estar logado).
  {
    element: (
      <ProtectedRoute>
        <AreaLogada />
      </ProtectedRoute>
    ),
    children: [
      { path: "/perfil", element: <Perfil /> },
      { path: "/perfil/analise/:id", element: <DetalheAnalise /> },
      { path: "/menu-user", element: <TimelineInterface /> },
      { path: "/menu-user/painel", element: <InterfaceUser /> },
      { path: "/menu-user/projects", element: <ProjectInterface /> },
      { path: "/menu-user/messages", element: <MessageInterface /> },
      { path: "/menu-user/notifications", element: <NotificationInterface /> },
      { path: "/menu-user/portfolio", element: <PortfolioInterface /> },
      { path: "/menu-user/buscar", element: <Search /> },
      { path: "/menu-user/validacao", element: <ValidacaoInterface /> },
      { path: "/menu-user/reputacao", element: <ReputacaoInterface /> },
      { path: "/menu-user/profile", element: <Profile /> },
      { path: "/menu-user/settings", element: <Settings /> },
      { path: "/menu-user/pontos-recarga", element: <PontosRecarga /> },
      { path: "/menu-user/administration", element: <AdminRoute><Administration /></AdminRoute> },
    ],
  },
]);

// Se a sessão do Firebase acabar (expirou, saiu em outra aba), o cache da
// interface é limpo e as rotas protegidas voltam para /login.
observarSessao();

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
