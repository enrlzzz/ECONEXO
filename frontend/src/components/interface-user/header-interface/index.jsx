import "./index.css";
import "/src/variables.css";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useUserData } from "../../../useUserData";
import { logout } from "../../../userSession";

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
  const { nome, cidade, estado, role, initials, color } = useUserData();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "var(--whitesmoke)";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const primeiroNome = (nome || "").split(" ")[0] || "Usuário";
  const localizacao = [cidade, estado].filter(Boolean).join(" · ");

  return (
    <>
      <header className="header-interface">
        {/* PERFIL — canto superior esquerdo */}
        <div className="header-left-profile">
          <button
            type="button"
            className="profile-chip"
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-label="Abrir menu do usuário"
          >
            <span
              className="profile-chip-avatar"
              style={{ background: color }}
            >
              {initials || "?"}
            </span>
            <span className="profile-chip-info">
              <span className="profile-chip-name">{primeiroNome}</span>
              <span className="profile-chip-meta">
                {localizacao || role || "EcoNexo"}
              </span>
            </span>
          </button>

          {userMenuOpen && (
            <div className="profile-dropdown eco-anim-fade-down">
              <div className="profile-dropdown-head">
                <span
                  className="profile-dropdown-avatar"
                  style={{ background: color }}
                >
                  {initials || "?"}
                </span>
                <div>
                  <strong>{nome || "Usuário"}</strong>
                  <small>{localizacao || role || ""}</small>
                </div>
              </div>
              <Link
                to="/menu-user/profile"
                onClick={() => setUserMenuOpen(false)}
              >
                Meu perfil
              </Link>
              <Link
                to="/menu-user/painel"
                onClick={() => setUserMenuOpen(false)}
              >
                <MdSpaceDashboard /> Painel
              </Link>
              <Link
                to="/menu-user/settings"
                onClick={() => setUserMenuOpen(false)}
              >
                Configurações
              </Link>
              <button type="button" onClick={handleLogout} className="logout">
                <FiLogOut /> Sair
              </button>
            </div>
          )}

          {/*
            A logo leva para a home pública "/", não para a timeline.
            Já existe "Início" no menu para voltar à timeline; a logo é o
            caminho de volta para fora da área logada — e o header de lá
            mostra o perfil conectado, não "Entrar/Cadastre-se".
          */}
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
      {userMenuOpen && (
        <div
          className="profile-overlay"
          onClick={() => setUserMenuOpen(false)}
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
