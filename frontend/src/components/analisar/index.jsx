import { useEffect } from "react";

import PaginaPublica from "../layout/PaginaPublica";
import EconomiaAnalise from "../main/economia-analise";
import { aquecerApi } from "../../services/api";

/** /analisar — pública. Visitante nunca é barrado aqui. */
export default function Analisar() {
  // Acorda o backend (Render free dorme) enquanto a pessoa escolhe os PDFs.
  useEffect(() => {
    aquecerApi();
  }, []);

  return (
    <PaginaPublica>
      <section className="eco-faixa eco-faixa--nevoa">
        <div className="eco-estreito" style={{ display: "flex", flexDirection: "column", gap: "3.2rem" }}>
          <header>
            <p className="eco-kicker">Análise de conta</p>
            <h1 className="eco-titulo-secao">Entenda sua conta de energia.</h1>
            <p className="eco-corpo eco-mudo" style={{ marginTop: "1.6rem" }}>
              Envie pelo menos duas contas em PDF. Comparando meses diferentes, separamos o que é consumo real do que é
              bandeira, imposto ou reajuste — e estimamos quanto a energia solar cobriria.
            </p>
          </header>
          <EconomiaAnalise />
        </div>
      </section>
    </PaginaPublica>
  );
}
