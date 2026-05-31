import { Link } from "react-router-dom";
import "./index.css";
import "/src/variables.css";

import { BsLightning } from "react-icons/bs";

export default function Header() {
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

      <div className="buttons">
        <Link to="/login">
          <button className="login-btn">Entrar</button>
        </Link>

        <Link to="/register">
          <button className="register-btn">Cadastre-se</button>
        </Link>
      </div>
    </header>
  );
}
