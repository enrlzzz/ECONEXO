import "./index.css";
import "/src/variables.css";

import { Link } from "react-router-dom";

import { useState } from "react";
import { useEffect } from "react";

import { useUserData } from "../../../useUserData";

import { IoStarSharp } from "react-icons/io5";
import { GoProjectRoadmap } from "react-icons/go";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { BsExclamationCircle } from "react-icons/bs";
import { MdAccessTime } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { FaUserGroup } from "react-icons/fa6";
import { FaUserEdit } from "react-icons/fa";

export default function MainInterface() {
  const { nome, cidade, estado } = useUserData();
  const [totalProjetos, setTotalProjetos] = useState(0);

  useEffect(() => {
    setTotalProjetos(localStorage.getItem("totalProjetos") || 0);
  }, []);

  return (
    <main className="main-interface">
      <div className="start-welcome">
        <h1>Bem-vindo, {nome}!</h1>
        <p>Gerencie seus projetos e encontre instaladores qualificados</p>
      </div>

      <div className="sections-profile">
        <div className="card-profile">
          <div className="card-title">
            <h3>Avaliação</h3>
            <span className="card-icon">
              <IoStarSharp />
            </span>
          </div>

          <p className="card-value">0.0</p>
          <p className="card-footer">0 avaliações</p>
        </div>
        <div className="card-profile">
          <div className="card-title">
            <h3>Projetos</h3>
            <span className="card-icon">
              <GoProjectRoadmap />
            </span>
          </div>

          <p className="card-value">{totalProjetos}</p>
          <p className="card-footer">0 concluídos</p>
        </div>
        <div className="card-profile">
          <div className="card-title">
            <h3>Portfólio</h3>
            <span className="card-icon">
              <FaArrowTrendUp />
            </span>
          </div>
          <p className="card-value">0</p>
          <p className="card-footer">0 verificados</p>
        </div>
        <div className="card-profile">
          <div className="card-title">
            <h3>Localização</h3>
            <span className="card-icon">
              <IoLocation />
            </span>
          </div>

          <p className="card-value">{cidade}</p>
          <p className="card-footer">{estado}</p>
        </div>
      </div>

      <div className="progress-profile">
        <div className="progress-header">
          <span>
            <BsExclamationCircle />
          </span>
          <h3 className="progress-h3">Complete seu perfil</h3>
        </div>
        <p className="progress-p">
          Seus documentos estão sendo validados. Complete seu portfólio enquanto
          isso!
        </p>

        <div className="progress-bar-container">
          <div className="progress-bar-labels">
            <span>Progresso do perfil</span>
            <span>60%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: "60%" }}></div>
          </div>
        </div>
        <Link to="/menu-user/portfolio">
          <button className="progress-btn">
            Adicionar Projetos ao Portfólio
          </button>
        </Link>
      </div>

      <div className="projects-section">
        <div className="recent-projects">
          <div className="recent-projects-header">
            <h2 className="recent-projects-h2">Projetos Recentes</h2>

            <Link to="/menu-user/projects">
              <button className="recent-projects-btn">
                <span>
                  <FiPlus />
                </span>
                Novo Projeto
              </button>
            </Link>
          </div>
          <p className="recent-projects-p">Seus últimos projetos</p>

          <div className="card-project">
            <span className="card-project-icon">
              <MdAccessTime />
            </span>
            <h3 className="card-project-h3">Sistema Comercial 15kWp</h3>
            <p className="card-project-p">Santos, SP</p>
            <span className="card-project-span">Em andamento</span>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Ações Rápidas</h2>
          <p>O que você gostaria de fazer?</p>

          <div className="actions">
            <Link to="/menu-user/buscar">
              <button>
                <span>
                  <FaUserGroup />
                </span>
                Buscar Instaladores
              </button>
            </Link>

            <Link to="/menu-user/projects">
              <button>
                <span>
                  <FiPlus />
                </span>
                Publicar Novo Projeto
              </button>
            </Link>
            <Link to="/menu-user/portfolio">
              <button>
                <span>
                  <FaArrowTrendUp />
                </span>
                Gerenciar Portfólio
              </button>
            </Link>
            <Link to="/menu-user/administration">
              <button>
                <span>
                  <FaUserEdit />
                </span>
                Administração
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
