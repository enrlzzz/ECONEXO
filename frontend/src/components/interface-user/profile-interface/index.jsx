import "./index.css";
import "/src/variables.css";

import HeaderInterface from "../header-interface";

import { TbMessageCircle } from "react-icons/tb";
import { IoStarSharp } from "react-icons/io5";
import { IoLocation } from "react-icons/io5";
import { GoProjectRoadmap } from "react-icons/go";
import { GiRibbonMedal } from "react-icons/gi";

import { Link } from "react-router-dom";

import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Profile() {
  const [abaAtiva, setAbaAtiva] = useState("portfolio");
  const { state: instalador } = useLocation();
  const portfolio = instalador?.portfolio || [];

  // se não vier nenhum instalador, use valores padrão
  const nome = instalador?.nome || "Instalador";
  const avaliacao = instalador?.avaliacao || 0;
  const avaliacoes = instalador?.avaliacoes || 0;
  const cidade = instalador?.cidade || "";
  const estado = instalador?.estado || "";

  return (
    <div className="container-profile">
      <HeaderInterface />

      <div className="box-info-profile">
        <div className="profile-left">
          <span className="avatar-profile">{nome.charAt(0)}</span>

          <div className="profile-details">
            <div className="profile-name-row">
              <h2>{nome}</h2>
            </div>
            <p className="profile-role">Instalador Fotovoltaico</p>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-icon star">
                  <IoStarSharp />
                </span>
                <div>
                  <h3>{avaliacao}</h3>
                  <p>{avaliacoes} avaliações</p>
                </div>
              </div>

              <div className="stat">
                <span className="stat-icon">
                  <IoLocation />
                </span>
                <div>
                  <h3>
                    {cidade}, {estado}
                  </h3>
                  <p>Localização</p>
                </div>
              </div>

              <div className="stat">
                <span className="stat-icon">
                  <GoProjectRoadmap />
                </span>
                <div>
                  <h3>2 Projetos</h3>
                  <p>1 verificados</p>
                </div>
              </div>
            </div>

            <div className="profile-badges">
              <span className="badge">NR-10 Certificado</span>
              <span className="badge">NR-35 Certificado</span>
              <span className="badge">Instalador Qualificado</span>
            </div>
          </div>
        </div>

        <div className="profile-right">
          <Link to="/menu-user/messages">
            <button className="btn-contatar-profile">
              <TbMessageCircle /> Mensagem
            </button>
          </Link>
          <button className="btn-conectar-profile">Conectar</button>
        </div>
      </div>

      {/* abas */}
      <div className="profile-tabs">
        <button
          className={abaAtiva === "portfolio" ? "tab ativo" : "tab"}
          onClick={() => setAbaAtiva("portfolio")}
        >
          Portfólio
        </button>
        <button
          className={abaAtiva === "avaliacoes" ? "tab ativo" : "tab"}
          onClick={() => setAbaAtiva("avaliacoes")}
        >
          Avaliações
        </button>
        <button
          className={abaAtiva === "sobre" ? "tab ativo" : "tab"}
          onClick={() => setAbaAtiva("sobre")}
        >
          Sobre
        </button>
      </div>

      {/* conteúdo por aba */}
      {abaAtiva === "portfolio" &&
        (portfolio.length === 0 ? (
          <div className="portfolio-vazio">
            <GiRibbonMedal className="portfolio-vazio-icon" />
            <p>Nenhum projeto no portfólio ainda</p>
          </div>
        ) : (
          <div className="portfolio-grid">
            {portfolio.map((proj) => (
              <div className="portfolio-card" key={proj.id}>
                <div className="portfolio-card-img">
                  <GiRibbonMedal className="portfolio-placeholder-icon" />
                  {proj.verificado && (
                    <span className="verified-badge">✓ Verificado</span>
                  )}
                </div>
                <div className="portfolio-card-info">
                  <h3>{proj.titulo}</h3>
                  <p>{proj.descricao}</p>
                  <span>{proj.data}</span>
                </div>
              </div>
            ))}
          </div>
        ))}

      {abaAtiva === "avaliacoes" && (
        <div className="avaliacoes-section">
          <p>Nenhuma avaliação ainda.</p>
        </div>
      )}

      {abaAtiva === "sobre" && (
        <div className="sobre-section">
          <p>Informações sobre o profissional.</p>
        </div>
      )}
    </div>
  );
}
