import "./index.css";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Resultado from "../main/economia-analise/Resultado";
import "../main/economia-analise/index.css";
import { economiaService } from "../../services/economia";

/** /perfil/analise/:id — uma análise do histórico, com opção de excluir. */
export default function DetalheAnalise() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState({ carregando: true, erro: "", analise: null });
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    let vivo = true;
    economiaService
      .detalhe(id)
      .then((analise) => vivo && setEstado({ carregando: false, erro: "", analise }))
      .catch((e) => vivo && setEstado({ carregando: false, erro: e.message, analise: null }));
    return () => {
      vivo = false;
    };
  }, [id]);

  async function excluir() {
    if (!window.confirm("Excluir esta análise do seu histórico? Não dá para desfazer.")) return;
    setExcluindo(true);
    try {
      await economiaService.excluir(id);
      navigate("/perfil", { replace: true });
    } catch (e) {
      setEstado((s) => ({ ...s, erro: e.message }));
      setExcluindo(false);
    }
  }

  const { carregando, erro, analise } = estado;

  return (
    <>
      <section className="eco-faixa eco-faixa--nevoa">
        <div className="eco-container perfil-detalhe">
          <Link className="eco-link eco-pequeno" to="/perfil">‹ Voltar ao histórico</Link>
          {carregando && <div className="eco-skeleton perfil-esqueleto" aria-busy="true" aria-label="Carregando análise" />}
          {erro && <p className="eco-alerta eco-alerta--erro" role="alert">{erro}</p>}
          {analise && (
            <>
              <p className="eco-pequeno eco-mudo">
                Analisada em {new Date(analise.criadaEm).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
              </p>
              <Resultado resultado={analise} />
              <div className="eco-acoes">
                <Link className="eco-btn eco-btn--primary eco-btn--sm" to="/analisar">Nova análise</Link>
                <button type="button" className="eco-btn eco-btn--ghost eco-btn--sm perfil-excluir" onClick={excluir}
                  disabled={excluindo} aria-busy={excluindo || undefined}>
                  {excluindo && <span className="eco-giro" aria-hidden="true" />}
                  Excluir análise
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
