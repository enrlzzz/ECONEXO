import { Link } from "react-router-dom";
import "./index.css";

/** Rodapé das páginas públicas — faixa névoa, texto de 12px. */
export default function Footer() {
  return (
    <footer className="site-rodape">
      <div className="site-rodape-in">
        <div className="site-rodape-col">
          <div>
            <h2>Produto</h2>
            <ul>
              <li><Link to="/analisar">Analisar conta</Link></li>
              <li><Link to="/#aprenda">Aprenda</Link></li>
              <li><Link to="/#profissionais">Para profissionais</Link></li>
            </ul>
          </div>
          <div>
            <h2>Conta</h2>
            <ul>
              <li><Link to="/login">Entrar</Link></li>
              <li><Link to="/register">Criar conta</Link></li>
              <li><Link to="/perfil">Minhas análises</Link></li>
            </ul>
          </div>
          <div>
            <h2>Projeto</h2>
            <ul>
              <li>Startup: Project One · Facens</li>
              <li>Equipe Lunitec</li>
            </ul>
          </div>
          <div>
            <h2>Legal</h2>
            <ul>
              <li><Link to="/politica-de-privacidade">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="site-rodape-base">
          <span>© 2026 EcoNexo. Projeto acadêmico.</span>
          <span>Feito em Sorocaba, SP.</span>
        </div>
      </div>
    </footer>
  );
}
