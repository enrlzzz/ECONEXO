import Header from "../header";
import Footer from "../footer";

/**
 * Moldura das páginas públicas: navegação no topo, rodapé névoa embaixo.
 * `id="conteudo"` é o alvo do "Pular para o conteúdo".
 */
export default function PaginaPublica({ children }) {
  return (
    <>
      <a className="eco-pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
