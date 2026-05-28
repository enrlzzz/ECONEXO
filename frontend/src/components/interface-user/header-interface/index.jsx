import "./index.css";
import "/src/variables.css";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useUserData } from "../../../useUserData";

import { BsLightning } from "react-icons/bs";
import { IoIosMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { GoProjectRoadmap } from "react-icons/go";
import { TbMessageCircle } from "react-icons/tb";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FaArrowTrendUp } from "react-icons/fa6";

export default function HeaderInterface() {
  const { nome } = useUserData();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "var(--whitesmoke)";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <>
      <header className="header-interface">
        <div className="logos-menu-interface">
          <Link to="/">
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
              <IoIosMenu /> Menu
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

        {/* RIGHT SIDE */}
        <div className="header-right">
          <Link to="/menu-user/settings">
            <span className="user-simbol">
              {nome.charAt(0).toUpperCase()}
            </span>
          </Link>

          {/* BOTÃO MENU MOBILE */}
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
          <IoIosMenu /> Menu
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
      </nav>
    </>
  );
}