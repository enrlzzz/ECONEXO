import "./index.css";
import "/src/variables.css";

import { Link } from "react-router-dom";

import { GoPerson } from "react-icons/go";
import { IoLocationOutline } from "react-icons/io5";
import { GiRibbonMedal } from "react-icons/gi";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { PiMedalFill } from "react-icons/pi";
import { ImUsers } from "react-icons/im";
import { IoIosSunny } from "react-icons/io";

export default function Main() {
  return (
    <main className="landing-main">
      <section className="introduction">
        <h1>Conectando Profissionais da</h1>
        <span>Energia Fotovoltaica</span>
        <p>
          A plataforma que une Engenheiros/Projetistas e Instaladores
          qualificados,
          <br /> criando um ecossistema de confiança no setor solar.
        </p>

        <div className="buttons">
          <Link to="/register">
            <button className="buttonStart">Comece Agora</button>
          </Link>
        </div>
      </section>

      <section id="operation">
        <div className="introduction-operation">
          <h2>Como Funciona</h2>
          <p>
            Uma plataforma simples e eficiente para conectar profissionais
            qualificados
          </p>
        </div>

        <div className="steps-operation">
          <div className="steps1">
            <span>
              <GoPerson />
            </span>
            <h3>1. Cadastre-se</h3>
            <p>
              Crie seu perfil como Engenheiro/Projetista ou <br />
              Instalador e envie suas certificações (CREA para <br />
              responsáveis técnicos, NR-10 e NR-35 para instaladores)
            </p>
          </div>
          <div className="steps2">
            <span>
              <IoLocationOutline />
            </span>
            <h3>2. Busque na sua Região</h3>
            <p>
              Encontre parceiros qualificados próximos a você
              <br /> usando nosso sistema de geolocalização
              <br /> inteligente
            </p>
          </div>
          <div className="steps3">
            <span>
              <GiRibbonMedal />
            </span>
            <h3>3. Construa Reputação</h3>
            <p>
              Após cada projeto, avaliem-se mutuamente e<br /> ganhem o selo de
              "Projeto Verificado" em seus
              <br /> portfólios
            </p>
          </div>
        </div>
      </section>

      <section id="points">
        <div className="introduction-points">
          <h2>Por Que Escolher o EcoNexo?</h2>
          <p>Diferenciais que tornam nossa plataforma única no mercado</p>
        </div>

        <div className="points-list">
          <div className="box-point1">
            <div className="point1">
              <span>
                <AiFillSafetyCertificate />
              </span>
              <h3>Profissionais Certificados</h3>
              <p>
                Validamos todas as certificações: CREA para responsáveis
                <br /> técnicos e projetistas, NR-10 e NR-35 para instaladores
              </p>
            </div>
            <div className="point2">
              <span>
                <FaLocationDot />
              </span>
              <h3>Busca Geolocalizada</h3>
              <p>
                Encontre parceiros na sua cidade, estado ou em
                <br /> um raio específico de distância
              </p>
            </div>
            <div className="point3">
              <span>
                <IoIosCheckmarkCircle />
              </span>
              <h3>Projetos Verificados</h3>
              <p>
                Sistema de avaliação mútua que gera selo de
                <br /> confiança em projetos realmente executados
              </p>
            </div>
          </div>

          <div className="box-point2">
            <div className="point4">
              <span>
                <PiMedalFill />
              </span>
              <h3>Portfólio Profissional</h3>
              <p>
                Mostre seus projetos com fotos e descrições,
                <br /> destacando os projetos verificados
              </p>
            </div>
            <div className="point5">
              <span>
                <ImUsers />
              </span>
              <h3>Rede de Confiança</h3>
              <p>
                Avaliações reais de parceiros que trabalharam
                <br /> juntos em projetos concretos
              </p>
            </div>
            <div className="point6">
              <span>
                <IoIosSunny />
              </span>
              <h3>Foco em Solar</h3>
              <p>
                Especialização em soluções de energia solar, com
                <br /> profissionais certificados e projetos verificados
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="final-main">
        <div className="final-content">
          <h2>Pronto para começar?</h2>
          <p>
            Junte-se à nossa comunidade e comece a encontrar os melhores
            parceiros para seus projetos de energia solar.
          </p>

          <Link to="/register">
            <button className="btn-primary">Criar Conta</button>
          </Link>
        </div>
      </section>
    </main>
  );
}
