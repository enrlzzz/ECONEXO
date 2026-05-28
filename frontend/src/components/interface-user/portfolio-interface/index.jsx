import "./index.css";
import "/src/variables.css";

import { useState, useEffect } from "react";

import HeaderInterface from "../header-interface";

import { FiPlus } from "react-icons/fi";
import { GiRibbonMedal } from "react-icons/gi";

export default function PortfolioInterface() {
  const [mostrarModal, setMostrarModal] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    foto: "",
  });

  const [projetos, setProjetos] = useState([]);

  /* =========================
     CARREGAR LOCAL STORAGE
  ========================= */

  useEffect(() => {
    const dados = localStorage.getItem("portfolio");

    if (dados) {
      setProjetos(JSON.parse(dados));
    }
  }, []);

  /* =========================
     SALVAR LOCAL STORAGE
  ========================= */

  useEffect(() => {
    localStorage.setItem("portfolio", JSON.stringify(projetos));
  }, [projetos]);

  /* =========================
     HANDLE INPUTS
  ========================= */

  const handleChange = (event) => {
    const { name, value, files, type } = event.target;

    if (type === "file") {
      const file = files[0];

      const reader = new FileReader();

      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          foto: reader.result,
        }));
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  /* =========================
     ADICIONAR PROJETO
  ========================= */

  const handlePublicar = (event) => {
    event.preventDefault();

    const novoProjeto = {
      id: projetos.length + 1,
      titulo: form.titulo,
      descricao: form.descricao,
      foto: form.foto,
      verificado: false,
    };

    setProjetos([...projetos, novoProjeto]);

    setMostrarModal(false);

    setForm({
      titulo: "",
      descricao: "",
      foto: "",
    });
  };

  /* =========================
     DADOS
  ========================= */

  const totalProjetos = projetos.length;

  const projetosVerificados = projetos.filter(
    (projeto) => projeto.verificado,
  ).length;

  const taxaVerificacao =
    totalProjetos > 0
      ? Math.round((projetosVerificados / totalProjetos) * 100)
      : 0;

  return (
    <div className="portfolio-interface">
      <HeaderInterface />

      {/* =========================
          HEADER
      ========================= */}

      <div className="portfolio-header">
        <h2>Meu Portfólio</h2>

        <p>Mostre seus projetos e construa sua reputação</p>
      </div>

      {/* =========================
          CARDS
      ========================= */}

      <div className="cards-portfolio">
        <div className="card-total-projects">
          <p className="card-title-portfolio">Total de Projetos</p>

          <p className="card-number-portfolio">
            {totalProjetos}
          </p>
        </div>

        <div className="card-projects-checked">
          <p className="card-title-portfolio">
            Projetos Verificados
          </p>

          <p className="card-number-portfolio">
            {projetosVerificados}
          </p>
        </div>

        <div className="card-verification-fee">
          <p className="card-title-portfolio">
            Taxa de Verificação
          </p>

          <p className="card-number-portfolio">
            {taxaVerificacao}%
          </p>
        </div>
      </div>

      {/* =========================
          LISTA
      ========================= */}

      <div className="portfolio-list">
        {projetos.length === 0 ? (
          <>
            <span className="span-item">
              <GiRibbonMedal />
            </span>

            <p className="title-1">
              Seu portfólio está vazio
            </p>

            <p className="title-2">
              Comece adicionando seus projetos de energia
              fotovoltaica
            </p>
          </>
        ) : (
          <div className="portfolio-projects">
            {projetos.map((projeto) => (
              <div
                className="portfolio-card"
                key={projeto.id}
              >
                {projeto.foto && (
                  <img
                    src={projeto.foto}
                    alt={projeto.titulo}
                  />
                )}

                <h3>{projeto.titulo}</h3>

                <p>{projeto.descricao}</p>
              </div>
            ))}
          </div>
        )}

        {/* =========================
            BOTÃO
        ========================= */}

        <button
          className="btn-add-project"
          onClick={() => setMostrarModal(true)}
        >
          <span className="span-btn">
            <FiPlus />
          </span>

          Adicionar Projeto
        </button>

        {/* =========================
            MODAL
        ========================= */}

        {mostrarModal && (
          <div className="modal-portfolio-overlay">
            <div className="modal-portfolio">
              <span
                className="close-modal"
                onClick={() => setMostrarModal(false)}
              >
                X
              </span>

              <h3>
                Adicionar Projeto ao Portfólio
              </h3>

              <p>
                Preencha os detalhes do projeto que você
                realizou
              </p>

              <form onSubmit={handlePublicar}>
                <label>Título do Projeto</label>

                <input
                  type="text"
                  name="titulo"
                  placeholder="Ex: Instalação Residencial 10kWp"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                />

                <label>Descrição</label>

                <input
                  type="text"
                  name="descricao"
                  placeholder="Descreva o projeto..."
                  value={form.descricao}
                  onChange={handleChange}
                  required
                />

                <label>Foto do Projeto</label>

                <input
                  type="file"
                  name="foto"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleChange}
                  required
                />

                <button type="submit">
                  Adicionar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}