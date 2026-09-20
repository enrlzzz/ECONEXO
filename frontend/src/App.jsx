import { useEffect } from "react";

import Footer from "./components/footer";
import Header from "./components/header";
import Main from "./components/main";

export default function App() {
  // A home é escura. Sem pintar o body junto, a área de overscroll (o
  // "elástico" no topo e no rodapé) aparece branca por baixo da página.
  useEffect(() => {
    document.body.style.backgroundColor = "var(--eco-dark-bg)";
    document.documentElement.style.colorScheme = "dark";
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.colorScheme = "";
    };
  }, []);

  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}
