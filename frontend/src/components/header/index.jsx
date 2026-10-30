import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./index.css";

import PerfilMenu from "../shared/perfil-menu";
import Marca from "../shared/marca";
import {
  useLogoAoTopo,
  useRolagemNoTopoAoTrocarDeRota,
} from "../../scrollSuave";

const LINKS = [
  { to: "/", rotulo: "Início", fim: true },
  { to: "/#aprenda", rotulo: "Aprenda", ancora: true },
  { to: "/analisar", rotulo: "Analisar conta" },
  { to: "/#profissionais", rotulo: "Para profissionais", ancora: true },
];

/**
 * Barra de navegação das páginas públicas (home, análise, entrar, perfil).
 * Fica presa no topo com fundo translúcido; no celular os links viram uma
 * lista que abre pelo botão de menu.
 */
export default function Header() {
  useRolagemNoTopoAoTrocarDeRota();
  const aoClicarLogo = useLogoAoTopo("/");
  const { pathname, hash } = useLocation();
  const [aberto, setAberto] = useState(false);
  const [rota, setRota] = useState(pathname + hash);

  // Trocou de página ou de âncora: fecha o menu do celular. Ajuste de
  // estado durante o render (padrão do React para "derivar de props").
  if (rota !== pathname + hash) {
    setRota(pathname + hash);
    setAberto(false);
  }

  return (
    <header className="site-nav">
      <div className="site-nav-in">
        <Link to="/" className="site-marca" onClick={aoClicarLogo} aria-label="EcoNexo, ir para o início">
          <Marca />
          EcoNexo
        </Link>

        <button
          type="button"
          className="site-nav-menu"
          aria-expanded={aberto}
          aria-controls="site-nav-links"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          onClick={() => setAberto((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            {aberto ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>

        <ul id="site-nav-links" className={`site-nav-links${aberto ? " is-aberto" : ""}`}>
          {LINKS.map((l) => (
            <li key={l.rotulo}>
              {l.ancora ? (
                <Link to={l.to}>{l.rotulo}</Link>
              ) : (
                <NavLink to={l.to} end={l.fim}>
                  {l.rotulo}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        <PerfilMenu mostrarAuth />
      </div>
    </header>
  );
}
