/** Peças visuais dos slides: fonte citada, ilustrações e gráficos. */

const BRASIL = [
  [2020, 19745],
  [2021, 34990],
  [2022, 49245],
  [2023, 93927],
  [2024, 177358],
  [2025, 223912],
];

const SOROCABA = [
  ["set/2023", 1383],
  ["set/2024", 2476],
  ["mar/2025", 3100],
  ["mar/2026", 5440],
];

export function Fonte({ children }) {
  return <p className="car-fonte">{children}</p>;
}

export function LinkFonte({ href, children }) {
  return (
    <a className="eco-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function Bateria() {
  return (
    <svg className="car-arte car-bateria" viewBox="0 0 440 300" role="img"
      aria-label="Esquema: tomada, carregador de bordo, bateria de tração, controlador e motor ligado às rodas.">
      <rect x="20" y="40" width="400" height="200" rx="60" fill="#f5f5f7" />
      <circle cx="110" cy="250" r="32" fill="#1d1d1f" /><circle cx="110" cy="250" r="12" fill="#d6d6d6" />
      <circle cx="330" cy="250" r="32" fill="#1d1d1f" /><circle cx="330" cy="250" r="12" fill="#d6d6d6" />
      <rect x="120" y="150" width="200" height="56" rx="12" fill="#0a7f4f" />
      <g fill="#fff" opacity=".9">
        <rect x="134" y="164" width="34" height="28" rx="4" /><rect x="176" y="164" width="34" height="28" rx="4" />
        <rect x="218" y="164" width="34" height="28" rx="4" /><rect x="260" y="164" width="34" height="28" rx="4" />
      </g>
      <text x="220" y="226" textAnchor="middle">Bateria de tração</text>
      <rect x="44" y="84" width="70" height="40" rx="10" fill="#fff" stroke="#86868b" />
      <text x="79" y="108" textAnchor="middle">Carregador</text>
      <rect x="186" y="74" width="70" height="40" rx="10" fill="#fff" stroke="#86868b" />
      <text x="221" y="98" textAnchor="middle">Controlador</text>
      <rect x="320" y="84" width="70" height="40" rx="10" fill="#fff" stroke="#86868b" />
      <text x="355" y="108" textAnchor="middle">Motor</text>
      <g fill="none" stroke="#a84b00" strokeWidth="3" strokeLinecap="round">
        <path className="car-fluxo" d="M79 124 V178 H120" />
        <path className="car-fluxo" d="M220 150 V114" />
        <path className="car-fluxo" d="M256 94 H320" />
        <path className="car-fluxo" d="M355 124 V218" />
      </g>
      <path d="M10 104 h34" stroke="#1d1d1f" strokeWidth="3" />
      <rect x="0" y="96" width="12" height="16" rx="2" fill="#1d1d1f" />
    </svg>
  );
}

export function GraficoBrasil() {
  const max = BRASIL[BRASIL.length - 1][1];
  return (
    <figure className="car-grafico">
      <ol className="car-barras" aria-label="Vendas anuais de eletrificados leves no Brasil">
        {BRASIL.map(([ano, v], i) => {
          const anterior = i ? BRASIL[i - 1][1] : null;
          return (
            <li key={ano} style={{ "--h": `${(v / max) * 100}%`, "--i": i }}>
              <span className="car-barra-valor eco-num">{(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil</span>
              <span className="car-barra" aria-hidden="true" />
              <span className="car-barra-ano">{ano}</span>
              <span className="car-barra-var eco-num">
                {anterior ? `+${Math.round((v / anterior - 1) * 100)}%` : " "}
              </span>
              <span className="eco-sr-only">: {v.toLocaleString("pt-BR")} unidades</span>
            </li>
          );
        })}
      </ol>
      <figcaption className="car-legenda"><i style={{ background: "#0a7f4f" }} />Brasil — vendas por ano</figcaption>

      <ol className="car-linhas" aria-label="Frota eletrificada de Sorocaba">
        {SOROCABA.map(([rotulo, v], i) => (
          <li key={rotulo} style={{ "--w": `${(v / 5440) * 100}%`, "--i": i }}>
            <span className="car-linha-rotulo">{rotulo}</span>
            <span className="car-linha-trilho"><span className="car-linha" aria-hidden="true" /></span>
            <span className="car-linha-valor eco-num">{v.toLocaleString("pt-BR")}</span>
          </li>
        ))}
      </ol>
      <p className="car-legenda"><i style={{ background: "#a84b00" }} />Sorocaba — frota eletrificada (veículos)</p>
    </figure>
  );
}

export function Limpeza() {
  return (
    <svg className="car-arte" viewBox="0 0 440 300" role="img"
      aria-label="Ilustração: escova macia limpando um módulo solar com água, ao amanhecer.">
      <rect x="0" y="0" width="440" height="300" rx="28" fill="#f5f5f7" />
      <circle cx="370" cy="70" r="30" fill="#f5c46b" />
      <g transform="translate(70 120) skewX(-20)">
        <rect width="260" height="140" rx="8" fill="#1d3b5c" />
        <g stroke="#3c6a96" strokeWidth="1.4"><path d="M65 0v140M130 0v140M195 0v140M0 47h260M0 94h260" /></g>
        <rect x="0" y="0" width="120" height="140" fill="#fff" opacity=".12" />
      </g>
      <g transform="translate(220 80) rotate(25)">
        <rect x="-6" y="0" width="12" height="90" rx="6" fill="#86868b" />
        <rect x="-40" y="88" width="80" height="22" rx="8" fill="#0a7f4f" />
        <g stroke="#0a7f4f" strokeWidth="2"><path d="M-34 110v10M-22 110v10M-10 110v10M2 110v10M14 110v10M26 110v10" /></g>
      </g>
      <g fill="#7fb3e0"><circle cx="150" cy="110" r="4" /><circle cx="168" cy="96" r="3" /><circle cx="140" cy="92" r="3" /></g>
    </svg>
  );
}
