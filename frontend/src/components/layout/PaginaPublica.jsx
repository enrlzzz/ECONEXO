import { Link, useLocation } from "react-router-dom";
import Header from "../header";
import Footer from "../footer";

/**
 * Moldura das páginas públicas: navegação no topo, rodapé névoa embaixo.
 * `id="conteudo"` é o alvo do "Pular para o conteúdo".
 */
export default function PaginaPublica({ children }) {
  const { pathname } = useLocation();
  const rotulos = { "/": "Início", "/login": "Entrar", "/register": "Criar conta", "/analisar": "Analisar conta", "/politica-de-privacidade": "Política de Privacidade" };
  const rotulo = rotulos[pathname] || "Página não encontrada";
  return (
    <>
      <a className="eco-pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <nav className="trilha-publica" aria-label="Navegação estrutural">
          <ol>{pathname !== "/" && <li><Link to="/">Início</Link></li>}<li aria-current="page">{rotulo}</li></ol>
          {pathname !== "/" && <Link to="/">← Voltar ao início</Link>}
        </nav>
        {children}
      </main>
      <Footer />
    </>
  );
}
