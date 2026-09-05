import { Link } from "react-router-dom";
import "./index.css";
import "/src/variables.css";

import { BsLightning } from "react-icons/bs";

import PerfilMenu from "../shared/perfil-menu";

/**
 * Header da home pública.
 *
 * O bloco da direita é o PerfilMenu compartilhado: mostra "Entrar /
 * Cadastre-se" para visitante e o perfil conectado para quem tem sessão.
 * Antes esta lógica vivia aqui dentro e não existia em nenhuma outra página.
 */
export default function Header() {
  return (
    <header className="landing-header">
      <Link to="/" className="logos" aria-label="Ir para a home do EcoNexo">
        <span className="logo-title">
          <BsLightning />
        </span>
        <span className="title">EcoNexo</span>
      </Link>

      <nav className="links">
        <a href="#operation"> Funcionalidades </a>
        <a href="#points"> Benefícios</a>
      </nav>

      <PerfilMenu mostrarAuth />
    </header>
  );
}
