import TextoAnalise from "./TextoAnalise";

const reais = (v) =>
  v == null ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const kwh = (v) => (v == null ? "—" : `${Math.round(Number(v)).toLocaleString("pt-BR")} kWh`);

function media(lista) {
  const v = lista.filter((x) => x != null).map(Number);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/** Variação % entre a primeira e a última conta com valor. */
function variacao(lista) {
  const v = lista.filter((x) => x != null).map(Number);
  if (v.length < 2 || !v[0]) return null;
  return Math.round(((v[v.length - 1] - v[0]) / v[0]) * 100);
}

function Delta({ valor, sufixo = "no período" }) {
  if (valor == null) return null;
  if (valor === 0) return <p className="resultado-delta eco-mudo">Estável {sufixo}</p>;
  // Conta subir é ruim para o cliente: vermelho. Cair, verde.
  return (
    <p className={`resultado-delta ${valor > 0 ? "is-sobe" : "is-desce"}`}>
      <span aria-hidden="true">{valor > 0 ? "▲" : "▼"}</span> {Math.abs(valor)}% {sufixo}
    </p>
  );
}

/**
 * Resultado de uma análise: resumo, métricas, tabela por mês e o texto da IA.
 * Usado logo depois de analisar e ao abrir uma análise do histórico.
 */
export default function Resultado({ resultado }) {
  const meses = resultado.meses || [];
  const consumos = meses.map((m) => m.consumoKwh);
  const valores = meses.map((m) => m.valorReais);
  const temNumeros = consumos.some((v) => v != null) || valores.some((v) => v != null);

  return (
    <article className="resultado" aria-labelledby="resultado-titulo">
      <p className="eco-rotulo">Resultado da análise</p>
      <h2 id="resultado-titulo" className="eco-titulo-secao resultado-titulo">
        {resultado.resumo || "Análise das suas contas"}
      </h2>

      {temNumeros && (
        <div className="eco-grade eco-grade--3 resultado-metricas">
          <div className="eco-card resultado-metrica">
            <p className="resultado-metrica-rotulo">Consumo médio</p>
            <p className="resultado-metrica-valor eco-num">{kwh(media(consumos))}</p>
            <Delta valor={variacao(consumos)} />
          </div>
          <div className="eco-card resultado-metrica">
            <p className="resultado-metrica-rotulo">Valor médio</p>
            <p className="resultado-metrica-valor eco-num">{reais(media(valores))}</p>
            <Delta valor={variacao(valores)} />
          </div>
          <div className="eco-card resultado-metrica">
            <p className="resultado-metrica-rotulo">Economia solar estimada</p>
            <p className="resultado-metrica-valor eco-num">
              {resultado.economiaSolarMensal != null ? `até ${reais(resultado.economiaSolarMensal)}/mês` : "—"}
            </p>
            <p className="resultado-delta eco-mudo">Estimativa, não é orçamento</p>
          </div>
        </div>
      )}

      {meses.length > 0 && (
        <div className="eco-card resultado-bloco">
          <h3 className="eco-titulo-card">Conta a conta</h3>
          <table className="resultado-tabela">
            <thead>
              <tr>
                <th scope="col">Mês</th>
                <th scope="col">Consumo</th>
                <th scope="col">Valor</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((m, i) => (
                <tr key={i}>
                  <td className="eco-num">{m.referencia || `Conta ${i + 1}`}</td>
                  <td className="eco-num">{kwh(m.consumoKwh)}</td>
                  <td className="eco-num">{reais(m.valorReais)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="eco-pequeno eco-mudo">“—” = o dado não foi encontrado na conta.</p>
        </div>
      )}

      <div className="eco-card resultado-bloco">
        <TextoAnalise texto={resultado.analise} />
        {resultado.fonte && <p className="resultado-fonte">Análise gerada por IA ({resultado.fonte}). Confira os valores na sua conta.</p>}
      </div>
    </article>
  );
}
