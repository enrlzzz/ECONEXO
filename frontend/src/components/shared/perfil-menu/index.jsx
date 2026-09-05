import "./index.css";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FiLogOut } from "react-icons/fi";
import { IoIosMenu } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineShield } from "react-icons/md";

import { logout, isAdmin } from "../../../userSession";
import { useLogado, useUserData } from "../../../useUserData";

/**
 * Menu de perfil — único no projeto.
 *
 * Existe porque a home tinha a própria cópia dessa lógica e as demais páginas
 * públicas (login, cadastro, política) não tinham nenhuma: quem estava logado
 * e abria a política de privacidade via uma página sem nenhum sinal de sessão.
 * Duas implementações do mesmo menu divergem na primeira mudança.
 *
 * Props:
 *   mostrarAuth — desenha "Entrar / Cadastre-se" quando NÃO há sessão.
 *     Fica false em /login e /register, onde oferecer "Entrar" é redundante.
 *   flutuante — posiciona no canto superior direito da página, para telas
 *     que não têm barra de header própria.
 *   ancora — "direita" (padrão) ou "esquerda". Na área logada o chip fica no
 *     canto ESQUERDO do header, então o dropdown precisa abrir alinhado por
 *     ali; ancorado à direita ele escaparia da tela.
 */
export default function PerfilMenu({
  mostrarAuth = false,
  flutuante = false,
  ancora = "direita",
}) {
  const navigate = useNavigate();
  const logado = useLogado();
  const { nome, initials, color, cidade, estado } = useUserData();

  const [aberto, setAberto] = useState(false);

  // Sessão que cai (token expirado, logout em outra aba) fecha o menu
  // sozinha: o dropdown só existe dentro do ramo `logado` do return, então
  // não sobra dropdown aberto sem perfil por trás. Não precisa de effect.

  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (e) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  const sair = () => {
    logout();
    setAberto(false);
    // useLogado() reage ao evento de sessão e o menu vira Entrar/Cadastre-se
    // sozinho. Ir para "/" só para reforçar que a sessão acabou.
    navigate("/", { replace: true });
  };

  const classeRaiz = [
    "perfil-menu",
    flutuante ? "is-flutuante" : "",
    ancora === "esquerda" ? "is-ancora-esquerda" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!logado) {
    if (!mostrarAuth) return null;
    return (
      <div className={classeRaiz}>
        <div className="perfil-menu-auth">
          <Link to="/login">
            <button className="login-btn">Entrar</button>
          </Link>
          <Link to="/register">
            <button className="register-btn">Cadastre-se</button>
          </Link>
        </div>
      </div>
    );
  }

  const primeiroNome = (nome || "").split(" ")[0] || "Você";
  const admin = isAdmin();
  const localizacao = [cidade, estado].filter(Boolean).join(" · ");

  return (
    <div className={classeRaiz}>
      <button
        type="button"
        className="perfil-menu-chip"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label="Abrir menu do usuário"
      >
        <span className="perfil-menu-avatar" style={{ background: color }}>
          {initials || "?"}
        </span>
        <span className="perfil-menu-info">
          <span className="perfil-menu-nome">{primeiroNome}</span>
          {localizacao && (
            <span className="perfil-menu-meta">{localizacao}</span>
          )}
        </span>
      </button>

      {aberto && (
        <>
          <div
            className="perfil-menu-overlay"
            onClick={() => setAberto(false)}
          />
          <div className="perfil-menu-dropdown eco-anim-fade-down" role="menu">
            <div className="perfil-menu-dropdown-head">
              <span className="perfil-menu-avatar" style={{ background: color }}>
                {initials || "?"}
              </span>
              <div>
                <strong>{nome || "Usuário"}</strong>
                {localizacao && <small>{localizacao}</small>}
              </div>
            </div>

            <Link to="/menu-user" onClick={() => setAberto(false)}>
              <IoIosMenu /> Timeline
            </Link>
            <Link to="/menu-user/painel" onClick={() => setAberto(false)}>
              <MdSpaceDashboard /> Painel
            </Link>
            <Link to="/menu-user/profile" onClick={() => setAberto(false)}>
              <CgProfile /> Meu perfil
            </Link>
            <Link to="/menu-user/settings" onClick={() => setAberto(false)}>
              <IoSettingsOutline /> Configurações
            </Link>

            {/* Só aparece para administrador. Esconder o item é conveniência:
                quem autoriza o painel de verdade tem que ser o backend. */}
            {admin && (
              <Link
                to="/menu-user/administration"
                onClick={() => setAberto(false)}
              >
                <MdOutlineShield /> Administração
              </Link>
            )}

            <button type="button" onClick={sair} className="logout">
              <FiLogOut /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
