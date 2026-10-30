import "./index.css";

import { Link } from "react-router-dom";

import Carrossel from "../carrossel";
import Equipe from "../equipe";

const PASSOS = [
  {
    rotulo: "Grátis, sem conta",
    titulo: "Analise sua conta",
    texto: "Envie de 2 a 6 contas em PDF. Mostramos o que é consumo, bandeira e imposto, e quanto a energia solar cobriria.",
  },
  {
    titulo: "Encontre um profissional",
    texto: "Busque engenheiros e instaladores por cidade, com CREA, NR-10 ou NR-35 verificados.",
  },
  {
    titulo: "Acompanhe o histórico",
    texto: "Com conta, cada análise fica salva no seu perfil para comparar mês a mês.",
  },
];

const DIFERENCIAIS = [
  { titulo: "Profissionais certificados", texto: "CREA para engenheiros e projetistas; NR-10 ou NR-35 para instaladores." },
  { titulo: "Busca por região", texto: "Parceiros na sua cidade, no seu estado ou num raio de distância." },
  { titulo: "Projetos verificados", texto: "Avaliação mútua gera o selo de confiança em projetos realmente executados." },
  { titulo: "Portfólio profissional", texto: "Projetos com fotos e descrição, destacando os já verificados." },
  { titulo: "Rede de confiança", texto: "Avaliações reais de quem trabalhou junto em projetos concretos." },
  { titulo: "Foco em energia solar", texto: "Uma plataforma só para o setor fotovoltaico." },
];

/** Ilustração própria do hero: telhado com módulos fotovoltaicos. */
function ArteHero() {
  return (
    <svg className="home-hero-arte" viewBox="0 0 880 360" aria-hidden="true" focusable="false">
      <circle cx="720" cy="80" r="44" fill="#f5c46b" />
      <g stroke="#f5c46b" strokeWidth="4" strokeLinecap="round">
        <path d="M720 14v14M720 132v14M654 80h14M772 80h14M673 33l10 10M757 117l10 10M767 33l-10 10M683 117l-10 10" />
      </g>
      <path d="M120 300 L300 150 L640 150 L760 300 Z" fill="#e6e6e8" />
      <g transform="translate(300 150) skewX(-38)">
        <g fill="#1d3b5c">
          <rect x="40" y="18" width="88" height="52" rx="4" /><rect x="136" y="18" width="88" height="52" rx="4" />
          <rect x="232" y="18" width="88" height="52" rx="4" /><rect x="40" y="78" width="88" height="52" rx="4" />
          <rect x="136" y="78" width="88" height="52" rx="4" /><rect x="232" y="78" width="88" height="52" rx="4" />
        </g>
        <g stroke="#3c6a96" strokeWidth="1.2">
          <path d="M84 18v52M180 18v52M276 18v52M84 78v52M180 78v52M276 78v52M40 44h280M40 104h280" />
        </g>
      </g>
      <rect x="150" y="300" width="580" height="40" fill="#f5f5f7" />
    </svg>
  );
}

export default function Main() {
  return (
    <div className="home">
      <section className="home-hero eco-container">
        <p className="eco-kicker">Energia fotovoltaica</p>
        <h1 className="eco-hero-titulo">
          Sua conta de luz, explicada. Seu projeto, bem instalado.
        </h1>
        <p className="home-hero-texto">
          Analise sua conta de energia de graça e encontre engenheiros e instaladores solares com certificações verificadas.
        </p>
        <div className="eco-acoes home-hero-acoes">
          <Link className="eco-btn eco-btn--primary" to="/analisar">Analisar minha conta</Link>
          <Link className="eco-btn eco-btn--ghost" to="/register">Sou profissional</Link>
        </div>
        <ArteHero />
      </section>

      <section className="eco-faixa eco-faixa--nevoa" id="aprenda" aria-labelledby="aprenda-titulo">
        <div className="eco-container">
          <div className="home-topo-secao">
            <h2 className="eco-titulo-secao" id="aprenda-titulo">Aprenda em 3 minutos.</h2>
            <a className="eco-link eco-link-seta eco-pequeno" href="#profissionais">Fale com um profissional</a>
          </div>
          <Carrossel />
        </div>
      </section>

      <section className="eco-faixa" id="como-funciona" aria-labelledby="como-titulo">
        <div className="eco-container">
          <h2 className="eco-titulo-secao home-titulo" id="como-titulo">Como funciona.</h2>
          <ol className="eco-grade eco-grade--3 home-lista">
            {PASSOS.map((p) => (
              <li key={p.titulo} className="eco-card">
                {p.rotulo && <p className="eco-rotulo">{p.rotulo}</p>}
                <h3 className="eco-titulo-card">{p.titulo}</h3>
                <p className="eco-corpo eco-mudo">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Equipe />

      <section className="eco-faixa" id="profissionais" aria-labelledby="pro-titulo">
        <div className="eco-container">
          <p className="eco-kicker">Para profissionais</p>
          <h2 className="eco-titulo-secao" id="pro-titulo">Sua certificação vira confiança.</h2>
          <p className="eco-corpo eco-mudo home-pro-texto">
            Engenheiros e projetistas validam o CREA. Instaladores comprovam ao menos uma NR — NR-10 ou NR-35. Quem contrata
            vê o selo antes de chamar.
          </p>
          <ul className="eco-grade eco-grade--3 home-lista home-diferenciais">
            {DIFERENCIAIS.map((d) => (
              <li key={d.titulo} className="eco-card">
                <h3 className="eco-titulo-card">{d.titulo}</h3>
                <p className="eco-corpo eco-mudo">{d.texto}</p>
              </li>
            ))}
          </ul>
          <div className="eco-acoes home-pro-acoes">
            <Link className="eco-btn eco-btn--primary" to="/register">Criar conta profissional</Link>
            <Link className="eco-btn eco-btn--texto eco-link-seta" to="/login">Já tenho conta</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
