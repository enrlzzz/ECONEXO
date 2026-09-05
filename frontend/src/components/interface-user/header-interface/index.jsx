import "./index.css";
import "/src/variables.css";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { logout } from "../../../userSession";
import PerfilMenu from "../../shared/perfil-menu";

import { BsLightning } from "react-icons/bs";
import { IoIosMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { GoProjectRoadmap } from "react-icons/go";
import { TbMessageCircle } from "react-icons/tb";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import { MdSpaceDashboard } from "react-icons/md";

export default function HeaderInterface() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "var(--whitesmoke)";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  // Mesmo destino do "Sair" do PerfilMenu: a home. Dois botões de sair que
  // levam a lugares diferentes é o tipo de divergência que essa consolidação
  // veio resolver.
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <header className="header-interface">
        {/*
          PERFIL — canto superior esquerdo.

          Era uma segunda implementação do mesmo menu que existe na home:
          chip, dropdown, overlay e logout duplicados. As duas já tinham
          divergido (esta não listava a Timeline). Agora é o componente
          compartilhado, ancorado à esquerda porque o chip fica desse lado.
        */}
        <div className="header-left-profile">
          <PerfilMenu ancora="esquerda" />

          <Link to="/" className="logos-menu-interface" title="Ir para a home">
            <span className="logo-title-menu-interface">
              <BsLightning />
            </span>
            <span className="title-menu-interface">EcoNexo</span>
          </Link>
        </div>

        {/* MENU DESKTOP */}
        <nav className="links-menu-interface">
          <Link to="/menu-user">
            <span>
              <IoIosMenu /> Início
            </span>
          </Link>

          <Link to="/menu-user/buscar">
            <span>
              <CiSearch /> Buscar
            </span>
          </Link>

          <Link to="/menu-user/projects">
            <span>
              <GoProjectRoadmap /> Projetos
            </span>
          </Link>

          <Link to="/menu-user/messages">
            <span>
              <TbMessageCircle /> Mensagens
            </span>
          </Link>

          <Link to="/menu-user/notifications">
            <span>
              <IoIosNotificationsOutline /> Notificações
            </span>
          </Link>

          <Link to="/menu-user/portfolio">
            <span>
              <FaArrowTrendUp /> Portfólio
            </span>
          </Link>
        </nav>

        {/* RIGHT SIDE — só o botão mobile */}
        <div className="header-right">
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <IoClose /> : <IoIosMenu />}
          </button>
        </div>
      </header>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* MENU MOBILE */}
      <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/menu-user" onClick={() => setMenuOpen(false)}>
          <IoIosMenu /> Início
        </Link>

        <Link to="/menu-user/painel" onClick={() => setMenuOpen(false)}>
          <MdSpaceDashboard /> Painel
        </Link>

        <Link to="/menu-user/buscar" onClick={() => setMenuOpen(false)}>
          <CiSearch /> Buscar
        </Link>

        <Link to="/menu-user/projects" onClick={() => setMenuOpen(false)}>
          <GoProjectRoadmap /> Projetos
        </Link>

        <Link to="/menu-user/messages" onClick={() => setMenuOpen(false)}>
          <TbMessageCircle /> Mensagens
        </Link>

        <Link
          to="/menu-user/notifications"
          onClick={() => setMenuOpen(false)}
        >
          <IoIosNotificationsOutline /> Notificações
        </Link>

        <Link to="/menu-user/portfolio" onClick={() => setMenuOpen(false)}>
          <FaArrowTrendUp /> Portfólio
        </Link>

        <button
          type="button"
          className="mobile-logout"
          onClick={() => {
            setMenuOpen(false);
            handleLogout();
          }}
        >
          <FiLogOut /> Sair
        </button>
      </nav>
    </>
  );
}
