import "./index.css";

import { Link } from "react-router-dom";

import { GoPerson } from "react-icons/go";
import { IoLocationOutline } from "react-icons/io5";
import { GiRibbonMedal } from "react-icons/gi";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosCheckmarkCircle, IoIosSunny } from "react-icons/io";
import { PiMedalFill } from "react-icons/pi";
import { ImUsers } from "react-icons/im";

import EconomiaAnalise from "./economia-analise";

/*
  As seções antes eram .steps1/.steps2/.steps3 e .point1..point6 — classes
  nomeadas pela POSIÇÃO. O mesmo CSS estava escrito seis vezes e reordenar
  um item exigia renomear tudo. Agora é dado, e o CSS existe uma vez só.
*/

const PASSOS = [
  {
    icone: <GoPerson />,
    titulo: "1. Cadastre-se",
    texto:
      "Crie seu perfil como Engenheiro/Projetista ou Instalador e envie suas certificações: CREA para responsáveis técnicos, NR-10 e NR-35 para instaladores.",
  },
  {
    icone: <IoLocationOutline />,
    titulo: "2. Busque na sua região",
    texto:
      "Encontre parceiros qualificados próximos a você usando nosso sistema de geolocalização inteligente.",
  },
  {
    icone: <GiRibbonMedal />,
    titulo: "3. Construa reputação",
    texto:
      "Após cada projeto, avaliem-se mutuamente e ganhem o selo de Projeto Verificado em seus portfólios.",
  },
];

const DIFERENCIAIS = [
  {
    icone: <AiFillSafetyCertificate />,
    titulo: "Profissionais certificados",
    texto:
      "Validamos todas as certificações: CREA para responsáveis técnicos e projetistas, NR-10 e NR-35 para instaladores.",
  },
  {
    icone: <FaLocationDot />,
    titulo: "Busca geolocalizada",
    texto:
      "Encontre parceiros na sua cidade, no seu estado ou em um raio específico de distância.",
  },
  {
    icone: <IoIosCheckmarkCircle />,
    titulo: "Projetos verificados",
    texto:
      "Sistema de avaliação mútua que gera selo de confiança em projetos realmente executados.",
  },
  {
    icone: <PiMedalFill />,
    titulo: "Portfólio profissional",
    texto:
      "Mostre seus projetos com fotos e descrições, destacando os que já foram verificados.",
  },
  {
    icone: <ImUsers />,
    titulo: "Rede de confiança",
    texto:
      "Avaliações reais de parceiros que trabalharam juntos em projetos concretos.",
  },
  {
    icone: <IoIosSunny />,
    titulo: "Foco em solar",
    texto:
      "Especialização em energia solar, com profissionais certificados e projetos verificados.",
  },
];

export default function Main() {
  return (
    <main className="landing-main">
      {/* ============================ HERO ============================ */}
      <section className="hero">
        {/* Light Rays (porte do Spell UI): é o que dá profundidade ao
            fundo chapado sem transformá-lo num gradiente. */}
        <div className="eco-rays" aria-hidden="true" />

        <div className="hero-conteudo">
          <p className="hero-kicker eco-blur-reveal">
            Engenharia e instalação fotovoltaica
          </p>

          <h1>
            Conectando profissionais da{" "}
            <span className="eco-gradient-text">Energia Fotovoltaica</span>
          </h1>

          <p className="hero-descricao">
            A plataforma que une Engenheiros/Projetistas e Instaladores
            qualificados, criando um ecossistema de confiança no setor solar.
          </p>

          <div className="hero-acoes eco-stagger">
            <Link
              to="/register"
              className="eco-btn eco-btn--on-dark eco-btn--rich"
              style={{ "--i": 0 }}
            >
              Comece agora
            </Link>
            <a
              href="#validador-economia"
              className="eco-btn eco-btn--outline-dark"
              style={{ "--i": 1 }}
            >
              Analisar minha conta de luz
            </a>
          </div>
        </div>
      </section>

      {/* ====================== VALIDADOR CPFL ======================== */}
      <EconomiaAnalise />

      {/* ========================= COMO FUNCIONA ====================== */}
      <section id="operation" className="secao">
        <header className="secao-cabecalho">
          <h2>Como funciona</h2>
          <p>
            Uma plataforma simples e eficiente para conectar profissionais
            qualificados.
          </p>
        </header>

        <ol className="grade grade--3 eco-stagger">
          {PASSOS.map((passo, indice) => (
            <li key={passo.titulo} className="cartao" style={{ "--i": indice }}>
              <span className="cartao-icone" aria-hidden="true">
                {passo.icone}
              </span>
              <h3>{passo.titulo}</h3>
              <p>{passo.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ========================= DIFERENCIAIS ======================= */}
      <section id="points" className="secao">
        <header className="secao-cabecalho">
          <h2>Por que escolher o EcoNexo?</h2>
          <p>Diferenciais que tornam nossa plataforma única no mercado.</p>
        </header>

        <ul className="grade grade--3 eco-stagger">
          {DIFERENCIAIS.map((item, indice) => (
            <li key={item.titulo} className="cartao" style={{ "--i": indice }}>
              <span className="cartao-icone" aria-hidden="true">
                {item.icone}
              </span>
              <h3>{item.titulo}</h3>
              <p>{item.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ============================ CTA ============================= */}
      <section className="chamada-final">
        <h2>Pronto para começar?</h2>
        <p>
          Junte-se à nossa comunidade e comece a encontrar os melhores parceiros
          para seus projetos de energia solar.
        </p>
        <Link to="/register" className="eco-btn eco-btn--on-dark eco-btn--rich">
          Criar conta
        </Link>
      </section>
    </main>
  );
}
