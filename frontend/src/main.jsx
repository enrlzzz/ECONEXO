import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./reset.css";
import "./variables.css";
import "./animations.css";
import App from "./App.jsx";
import Cadastro from "./components/cadastro/index.jsx";
import Login from "./components/login/index.jsx";
import InterfaceUser from "./components/interface-user/index.jsx";
import TimelineInterface from "./components/interface-user/timeline-interface/index.jsx";
import ProjectInterface from "./components/interface-user/project-interface/index.jsx";
import MessageInterface from "./components/interface-user/message-interface/index.jsx";
import NotificationInterface from "./components/interface-user/notification-interface/index.jsx";
import PortfolioInterface from "./components/interface-user/portfolio-interface/index.jsx";
import Search from "./components/interface-user/search-interface/index.jsx";
import Profile from "./components/interface-user/profile-interface/index.jsx";
import Settings from "./components/interface-user/settings-interface/index.jsx";
import Administration from "./components/interface-user/administration-interface/index.jsx";
import PoliticaPrivacidade from "./components/politica-privacidade/index.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

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

  {
    path: "/menu-user/profile",
    element: protect(<Profile />),
  },

  {
    path: "/menu-user/settings",
    element: protect(<Settings />),
  },

  {
    path: "/menu-user/administration",
    element: protect(<Administration />),
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
