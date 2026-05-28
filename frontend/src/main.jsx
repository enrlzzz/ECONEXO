import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./reset.css";
import "./variables.css";
import App from "./App.jsx";
import Cadastro from "./components/cadastro/index.jsx";
import Login from "./components/login/index.jsx";
import InterfaceUser from "./components/interface-user/index.jsx";
import ProjectInterface from "./components/interface-user/project-interface/index.jsx";
import MessageInterface from "./components/interface-user/message-interface/index.jsx";
import NotificationInterface from "./components/interface-user/notification-interface/index.jsx";
import PortfolioInterface from "./components/interface-user/portfolio-interface/index.jsx";
import Search from "./components/interface-user/search-interface/index.jsx";
import Profile from "./components/interface-user/profile-interface/index.jsx";
import Settings from "./components/interface-user/settings-interface/index.jsx";
import Administration from "./components/interface-user/administration-interface/index.jsx";

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
    path: "/menu-user",
    element: <InterfaceUser />,
  },

  {
    path: "/menu-user/projects",
    element: <ProjectInterface />,
  },

  {
    path: "/menu-user/messages",
    element: <MessageInterface />,
  },

  {
    path: "/menu-user/notifications",
    element: <NotificationInterface />,
  },

  {
    path: "/menu-user/portfolio",
    element: <PortfolioInterface />,
  },

  {
    path: "/menu-user/buscar",
    element: <Search />,
  },

  {
    path: "/menu-user/profile",
    element: <Profile />,
  },

  {
    path: "/menu-user/settings",
    element: <Settings />,
  },

  {
    path: "/menu-user/administration",
    element: <Administration />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
