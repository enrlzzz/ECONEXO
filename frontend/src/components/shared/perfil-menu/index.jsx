import "./index.css";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { isAdmin } from "../../../userSession";
import { sair } from "../../../auth/sessao";
import { useLogado, useUserData } from "../../../useUserData";

/**
 * Menu de perfil — único no projeto (home, páginas públicas e área logada).
 *
 * Visitante vê "Entrar" e "Criar conta". Com sessão, um avatar abre o menu
 * com os destinos da conta.
 *
 * Props:
 *   mostrarAuth — desenha "Entrar / Criar conta" quando NÃO há sessão.
 *   ancora — "direita" (padrão) ou "esquerda": de que lado o menu abre.
 */
export default function PerfilMenu({ mostrarAuth = false, ancora = "direita" }) {
  const navigate = useNavigate();
  const logado = useLogado();
  const { nome, initials, color, cidade, estado } = useUserData();
  const [aberto, setAberto] = useState(false);
  const raiz = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;
    const aoTeclar = (e) => e.key === "Escape" && setAberto(false);
    const aoClicarFora = (e) => !raiz.current?.contains(e.target) && setAberto(false);
    window.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoClicarFora);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoClicarFora);
    };
  }, [aberto]);

  const aoSair = async () => {
    setAberto(false);
    await sair();
    navigate("/", { replace: true });
  };

  if (!logado) {
    if (!mostrarAuth) return null;
    return (
      <div className="perfil-menu perfil-menu-auth">
        <Link to="/login" className="eco-btn eco-btn--ghost eco-btn--sm perfil-menu-entrar">
          Entrar
        </Link>
        <Link to="/register" className="eco-btn eco-btn--primary eco-btn--sm">
          Criar conta
        </Link>
      </div>
    );
  }

  const localizacao = [cidade, estado].filter(Boolean).join(" · ");
  const fechar = () => setAberto(false);

  return (
    <div className={`perfil-menu${ancora === "esquerda" ? " is-ancora-esquerda" : ""}`} ref={raiz}>
      <button
        type="button"
        className="perfil-menu-avatar"
        style={{ background: color }}
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Menu da conta de ${nome || "usuário"}`}
      >
        {initials || "?"}
      </button>

      {aberto && (
        <div className="perfil-menu-dropdown" role="menu">
          <div className="perfil-menu-cabeca">
            <strong>{nome || "Sua conta"}</strong>
            {localizacao && <small>{localizacao}</small>}
          </div>
          <Link role="menuitem" to="/perfil" onClick={fechar}>Minhas análises</Link>
          <Link role="menuitem" to="/menu-user" onClick={fechar}>Comunidade</Link>
          <Link role="menuitem" to="/menu-user/painel" onClick={fechar}>Painel profissional</Link>
          <Link role="menuitem" to="/menu-user/profile" onClick={fechar}>Perfil profissional</Link>
          <Link role="menuitem" to="/menu-user/settings" onClick={fechar}>Configurações</Link>
          {/* Esconder o item é conveniência: quem autoriza é o backend. */}
          {isAdmin() && (
            <Link role="menuitem" to="/menu-user/administration" onClick={fechar}>Administração</Link>
          )}
          <button role="menuitem" type="button" onClick={aoSair} className="perfil-menu-sair">
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
