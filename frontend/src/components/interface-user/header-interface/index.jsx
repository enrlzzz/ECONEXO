import "./index.css";

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { sair } from "../../../auth/sessao";
import { useNotificacoesNaoLidas } from "../../../useNotificacoesNaoLidas";
import PerfilMenu from "../../shared/perfil-menu";
import Marca from "../../shared/marca";
import { useLogoAoTopo, useRolagemNoTopoAoTrocarDeRota } from "../../../scrollSuave";

const LINKS = [
  { to: "/menu-user", rotulo: "Início", fim: true },
  { to: "/menu-user/buscar", rotulo: "Buscar" },
  { to: "/menu-user/projects", rotulo: "Projetos" },
  { to: "/menu-user/messages", rotulo: "Mensagens" },
  { to: "/menu-user/notifications", rotulo: "Notificações", notificacoes: true },
  { to: "/menu-user/portfolio", rotulo: "Portfólio" },
  { to: "/menu-user/validacao", rotulo: "Validação" },
  { to: "/menu-user/reputacao", rotulo: "Reputação" },
  { to: "/menu-user/pontos-recarga", rotulo: "Recarga EV" },
  { to: "/perfil", rotulo: "Minhas análises" },
];

/**
 * Navegação da área logada: a mesma barra de 52px das páginas públicas,
 * com os destinos do produto. Abaixo de 1100px os links viram uma lista
 * que abre pelo botão de menu.
 */
export default function HeaderInterface() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [rota, setRota] = useState(pathname);
  const naoLidas = useNotificacoesNaoLidas();

  useRolagemNoTopoAoTrocarDeRota();
  // Na área logada o logo aponta para a home social (/menu-user).
  const aoClicarLogo = useLogoAoTopo("/menu-user");

  // Trocou de página: fecha o menu do celular.
  if (rota !== pathname) {
    setRota(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    document.body.style.backgroundColor = "var(--eco-bg)";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const handleLogout = async () => {
    await sair();
    navigate("/", { replace: true });
  };

  return (
    <header className="header-interface">
      <div className="header-interface-in">
        <Link to="/menu-user" className="site-marca" onClick={aoClicarLogo} aria-label="EcoNexo, ir para o início da comunidade">
          <Marca />
          EcoNexo
        </Link>

        <nav aria-label="Área logada" className="header-interface-nav">
          <ul id="menu-interface" className={`header-interface-links${menuOpen ? " is-aberto" : ""}`}>
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.fim}>
                  {l.rotulo}
                  {l.notificacoes && naoLidas > 0 && (
                    <b className="notif-selo" aria-label={`${naoLidas} não lidas`}>
                      {naoLidas > 99 ? "99+" : naoLidas}
                    </b>
                  )}
                </NavLink>
              </li>
            ))}
            <li className="header-interface-sair">
              <button type="button" onClick={handleLogout}>Sair</button>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          className="header-interface-menu"
          aria-expanded={menuOpen}
          aria-controls="menu-interface"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>

        <PerfilMenu />
      </div>
    </header>
  );
}
