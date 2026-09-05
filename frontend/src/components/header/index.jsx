import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./index.css";
import "/src/variables.css";

import { BsLightning } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { MdSpaceDashboard } from "react-icons/md";
import { IoIosMenu } from "react-icons/io";

import { isLoggedIn, logout } from "../../userSession";
import { useUserData } from "../../useUserData";

/**
 * Header da home pública.
 *
 * Quem já está logado e volta para "/" (clicando na logo dentro da área
 * logada, por exemplo) não deve ver "Entrar" e "Cadastre-se" — isso sugeria
 * que a sessão tinha caído. Mostra o perfil conectado no lugar.
 *
 * O estado vem de isLoggedIn()/getUser() do userSession, nunca de uma
 * verificação própria: duas fontes de verdade sobre "estou logado?" divergem
 * na primeira mudança e a interface passa a se contradizer.
 */
export default function Header() {
  const navigate = useNavigate();
  const logado = isLoggedIn();
  const { nome, initials, color, cidade, estado } = useUserData();

  const [menuAberto, setMenuAberto] = useState(false);

  const sair = () => {
    logout();
    setMenuAberto(false);
    // Continua em "/" — a home é pública, não há motivo para expulsar
    // ninguém dela. O próprio re-render já troca o menu por Entrar/Cadastre-se.
    navigate("/", { replace: true });
  };

  const primeiroNome = (nome || "").split(" ")[0] || "Você";
  const localizacao = [cidade, estado].filter(Boolean).join(" · ");

  return (
    <header className="landing-header">
      <div className="logos">
        <span className="logo-title">
          <BsLightning />
        </span>
        <span className="title">EcoNexo</span>
      </div>

      <nav className="links">
        <a href="#operation"> Funcionalidades </a>
        <a href="#points"> Benefícios</a>
      </nav>

      {logado ? (
        <div className="header-user">
          <button
            type="button"
            className="header-user-chip"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label="Abrir menu do usuário"
            aria-expanded={menuAberto}
          >
            <span className="header-user-avatar" style={{ background: color }}>
              {initials || "?"}
            </span>
            <span className="header-user-info">
              <span className="header-user-name">{primeiroNome}</span>
              {localizacao && (
                <span className="header-user-meta">{localizacao}</span>
              )}
            </span>
          </button>

          {menuAberto && (
            <>
              <div
                className="header-user-overlay"
                onClick={() => setMenuAberto(false)}
              />
              <div className="header-user-dropdown eco-anim-fade-down">
                <div className="header-user-dropdown-head">
                  <span
                    className="header-user-avatar"
                    style={{ background: color }}
                  >
                    {initials || "?"}
                  </span>
                  <div>
                    <strong>{nome || "Usuário"}</strong>
                    {localizacao && <small>{localizacao}</small>}
                  </div>
                </div>

                <Link to="/menu-user" onClick={() => setMenuAberto(false)}>
                  <IoIosMenu /> Timeline
                </Link>
                <Link
                  to="/menu-user/painel"
                  onClick={() => setMenuAberto(false)}
                >
                  <MdSpaceDashboard /> Painel
                </Link>
                <Link
                  to="/menu-user/profile"
                  onClick={() => setMenuAberto(false)}
                >
                  Meu perfil
                </Link>
                <Link
                  to="/menu-user/settings"
                  onClick={() => setMenuAberto(false)}
                >
                  Configurações
                </Link>
                <button type="button" onClick={sair} className="logout">
                  <FiLogOut /> Sair
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="buttons">
          <Link to="/login">
            <button className="login-btn">Entrar</button>
          </Link>

          <Link to="/register">
            <button className="register-btn">Cadastre-se</button>
          </Link>
        </div>
      )}
    </header>
  );
}
