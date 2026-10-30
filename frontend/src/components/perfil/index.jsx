import "./index.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import PaginaPublica from "../layout/PaginaPublica";
import { economiaService } from "../../services/economia";
import { useUserData } from "../../useUserData";

const reais = (v) =>
  v == null ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const data = (iso) => new Date(iso).toLocaleDateString("pt-BR");

function media(lista) {
  const v = lista.filter((x) => x != null).map(Number);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/** Linha do valor médio de cada análise, da mais antiga para a mais nova. */
function Tendencia({ analises }) {
  const pontos = analises.filter((a) => a.valorMedio != null).slice().reverse();
  if (pontos.length < 2) {
    return <p className="eco-pequeno eco-mudo">A tendência aparece a partir da segunda análise com valores.</p>;
  }
  const valores = pontos.map((p) => Number(p.valorMedio));
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const larg = 600;
  const alt = 120;
  const x = (i) => 20 + (i * (larg - 40)) / (pontos.length - 1);
  const y = (v) => (max === min ? alt / 2 : 10 + ((max - v) * (alt - 20)) / (max - min));
  const descricao = pontos.map((p) => `${data(p.criadaEm)}: ${reais(p.valorMedio)}`).join("; ");

  return (
    <svg className="perfil-grafico" viewBox={`0 0 ${larg} ${alt + 30}`} role="img" aria-label={`Valor médio por análise: ${descricao}.`}>
      <g stroke="#e6e6e8">
        <line x1="0" y1="10" x2={larg} y2="10" />
        <line x1="0" y1={alt / 2 + 5} x2={larg} y2={alt / 2 + 5} />
        <line x1="0" y1={alt} x2={larg} y2={alt} />
      </g>
      <polyline fill="none" stroke="#0a7f4f" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
        points={pontos.map((p, i) => `${x(i)},${y(Number(p.valorMedio))}`).join(" ")} />
      {pontos.map((p, i) => (
        <circle key={p.id} cx={x(i)} cy={y(Number(p.valorMedio))} r={i === pontos.length - 1 ? 5 : 3} fill="#0a7f4f" />
      ))}
      {pontos.length <= 8 &&
        pontos.map((p, i) => (
          <text key={p.id} x={x(i)} y={alt + 24} textAnchor="middle">
            {new Date(p.criadaEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </text>
        ))}
    </svg>
  );
}

/**
 * /perfil — painel das contas analisadas. Rota protegida; os dados vêm de
 * GET /api/economia/historico, que só devolve as análises do dono do token.
 */
export default function Perfil() {
  const { nome, initials, color, cidade, estado } = useUserData();
  const [estadoTela, setEstadoTela] = useState({ carregando: true, erro: "", analises: [] });

  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let vivo = true;
    economiaService
      .historico()
      .then((analises) => vivo && setEstadoTela({ carregando: false, erro: "", analises }))
      .catch((e) => vivo && setEstadoTela({ carregando: false, erro: e.message, analises: [] }));
    return () => {
      vivo = false;
    };
  }, [tentativa]);

  const carregar = () => {
    setEstadoTela((s) => ({ ...s, carregando: true, erro: "" }));
    setTentativa((t) => t + 1);
  };

  const { carregando, erro, analises } = estadoTela;
  const primeiroNome = (nome || "").split(" ")[0];
  const local = [cidade, estado].filter(Boolean).join(", ");

  // Tendência simples: última análise contra a anterior.
  const comValor = analises.filter((a) => a.valorMedio != null);
  const tendencia =
    comValor.length >= 2 && Number(comValor[1].valorMedio)
      ? Math.round(((comValor[0].valorMedio - comValor[1].valorMedio) / comValor[1].valorMedio) * 100)
      : null;

  return (
    <PaginaPublica>
      <section className="eco-faixa eco-faixa--nevoa perfil">
        <div className="eco-container">
          <header className="perfil-cabecalho">
            <span className="perfil-avatar" style={{ background: color }} aria-hidden="true">{initials}</span>
            <div>
              <h1 className="eco-titulo-secao">{primeiroNome ? `Olá, ${primeiroNome}.` : "Seu perfil"}</h1>
              {local && <p className="eco-pequeno eco-mudo">{local}</p>}
            </div>
            <Link className="eco-btn eco-btn--primary eco-btn--sm perfil-nova" to="/analisar">Nova análise</Link>
          </header>

          {carregando && (
            <div className="eco-grade eco-grade--4 perfil-bloco" aria-busy="true" aria-label="Carregando suas análises">
              {[0, 1, 2, 3].map((i) => <div key={i} className="eco-skeleton perfil-esqueleto" />)}
            </div>
          )}

          {!carregando && erro && (
            <div className="eco-card perfil-bloco perfil-vazio" role="alert">
              <h2 className="eco-titulo-card">Não conseguimos carregar seu histórico.</h2>
              <p className="eco-corpo eco-mudo">{erro}</p>
              <button type="button" className="eco-btn eco-btn--primary" onClick={carregar}>Tentar de novo</button>
            </div>
          )}

          {!carregando && !erro && analises.length === 0 && (
            <div className="eco-card perfil-bloco perfil-vazio">
              <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
                <rect x="20" y="12" width="56" height="72" rx="10" fill="#e6f4ed" />
                <path d="M32 34h32M32 46h32M32 58h20" stroke="#0a7f4f" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <h2 className="eco-titulo-card">Nenhuma conta analisada ainda.</h2>
              <p className="eco-corpo eco-mudo">
                Envie duas contas de energia e veja, em minutos, o que está pesando no valor. As próximas análises aparecem aqui.
              </p>
              <Link className="eco-btn eco-btn--primary" to="/analisar">Analisar minha primeira conta</Link>
            </div>
          )}

          {!carregando && !erro && analises.length > 0 && (
            <>
              <div className="eco-grade eco-grade--4 perfil-bloco">
                <div className="eco-card perfil-metrica">
                  <p>Contas analisadas</p>
                  <strong className="eco-num">{analises.length}</strong>
                </div>
                <div className="eco-card perfil-metrica">
                  <p>Consumo médio</p>
                  <strong className="eco-num">
                    {media(analises.map((a) => a.consumoMedioKwh)) == null
                      ? "—"
                      : `${Math.round(media(analises.map((a) => a.consumoMedioKwh))).toLocaleString("pt-BR")} kWh`}
                  </strong>
                </div>
                <div className="eco-card perfil-metrica">
                  <p>Valor médio</p>
                  <strong className="eco-num">{reais(media(analises.map((a) => a.valorMedio)))}</strong>
                </div>
                <div className="eco-card perfil-metrica">
                  <p>Última análise</p>
                  <strong className="eco-num perfil-metrica-data">{data(analises[0].criadaEm)}</strong>
                </div>
              </div>

              <div className="eco-card perfil-bloco perfil-painel">
                <div className="perfil-painel-topo">
                  <h2 className="eco-titulo-card">Tendência do valor</h2>
                  {tendencia != null && (
                    <p className={`eco-pequeno ${tendencia > 0 ? "perfil-sobe" : tendencia < 0 ? "perfil-desce" : "eco-mudo"}`}>
                      {tendencia === 0
                        ? "Estável desde a análise anterior"
                        : `${tendencia > 0 ? "▲" : "▼"} ${Math.abs(tendencia)}% desde a análise anterior`}
                    </p>
                  )}
                </div>
                <Tendencia analises={analises} />
              </div>

              <div className="eco-card perfil-bloco perfil-painel">
                <h2 className="eco-titulo-card">Contas analisadas</h2>
                <table className="perfil-tabela">
                  <thead>
                    <tr>
                      <th scope="col">Data</th>
                      <th scope="col">Resumo</th>
                      <th scope="col">Período</th>
                      <th scope="col"><span className="eco-sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {analises.map((a) => (
                      <tr key={a.id}>
                        <td className="eco-num">{data(a.criadaEm)}</td>
                        <td>{a.resumo}</td>
                        <td className="eco-num">{a.periodo || "—"}</td>
                        <td>
                          <Link className="eco-link" to={`/perfil/analise/${a.id}`} aria-label={`Abrir análise de ${data(a.criadaEm)}`}>
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <p className="eco-pequeno eco-mudo perfil-links">
            Dados da conta e perfil profissional em{" "}
            <Link className="eco-link" to="/menu-user/settings">Configurações</Link> e{" "}
            <Link className="eco-link" to="/menu-user/profile">Perfil profissional</Link>.
          </p>
        </div>
      </section>
    </PaginaPublica>
  );
}
