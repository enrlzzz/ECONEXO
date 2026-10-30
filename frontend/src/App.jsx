import { useEffect } from "react";

import { aquecerApi } from "./services/api";
import PaginaPublica from "./components/layout/PaginaPublica";
import Main from "./components/main";

export default function App() {
  // Acorda o backend (Render free dorme) enquanto o visitante lê a página.
  useEffect(() => {
    aquecerApi();
  }, []);

  return (
    <PaginaPublica>
      <Main />
    </PaginaPublica>
  );
}
