import "./index.css";
import "/src/variables.css";

import { useState } from "react";

import { FiPlus } from "react-icons/fi";
import { IoLocation } from "react-icons/io5";
import { AiOutlineThunderbolt } from "react-icons/ai";

import HeaderInterface from "../header-interface";

export default function ProjectInterface() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    cidade: "",
    estado: "",
    potencia: "",
  });

  const [projetos, setProjetos] = useState([
    {
      id: 1,
      titulo: "Sistema Comercial 15kWp",
      descricao: "Instalação para estabelecimento comercial",
      cidade: "Santos",
      estado: "SP",
      potencia: "15",
      status: "Em andamento",
      data: "04/04/2024",
    },
  ]);

  const handlePublicar = (event) => {
    event.preventDefault();
    const novoProjeto = {
      id: projetos.length + 1,
      ...form,
      status: "Aberto",
      data: new Date().toLocaleDateString("pt-BR"),
    };
    setProjetos([...projetos, novoProjeto]);
    setMostrarModal(false);
    setForm({
      titulo: "",
      descricao: "",
      cidade: "",
      estado: "",
      potencia: "",
    });

    localStorage.setItem("totalProjetos", projetos.length + 1);
  };

  const total = projetos.length;
  const abertos = projetos.filter((p) => p.status === "Aberto").length;
  const emAndamento = projetos.filter(
    (p) => p.status === "Em andamento",
  ).length;
  const concluidos = projetos.filter((p) => p.status === "Concluído").length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="project-interface-container">
      <HeaderInterface />

      <div className="project-content">
        <div className="content-header">
          <h2>Projetos</h2>
          <button
            className="projects-btn"
            onClick={() => setMostrarModal(true)}
          >
            <span>
              <FiPlus />
            </span>
            Novo Projeto
          </button>

          {mostrarModal && (
            <div className="modal-overlay">
              <div className="modal">
                <span className="close" onClick={() => setMostrarModal(false)}>
                  X
                </span>
                <h3>Publicar Novo Projeto</h3>
                <span className="span-modal">
                  Publique um projeto e encontre instaladores qualificados
                </span>

                <form onSubmit={handlePublicar}>
                  <label htmlFor="titulo" className="label-name">
                    Título do Projeto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Instalação Residencial 10kWp"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="descricao" className="label-name">
                    Descrição
                  </label>
                  <input
                    type="text"
                    placeholder="Descreva o escopo do projeto, requisitos técnicos..."
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="cidade" className="label-name">
                    Cidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: São Paulo"
                    name="cidade"
                    value={form.cidade}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="estado" className="label-name">
                    Estado
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    required
                    value={form.estado}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>

                  <label htmlFor="potencia" className="label-name">
                    Potência (kWp)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 10"
                    name="potencia"
                    value={form.potencia}
                    onChange={handleChange}
                    required
                  />
                  <button type="submit">Publicar</button>
                </form>
              </div>
            </div>
          )}
        </div>
        <p>Gerencie seus projetos e encontre instaladores</p>
      </div>

      <div className="cards-content">
        <div className="card">
          <p className="card-content-title">Total</p>
          <p className="card-number">{total}</p>
        </div>
        <div className="card">
          <p className="card-content-title">Abertos</p>
          <p className="card-number">{abertos}</p>
        </div>
        <div className="card">
          <p className="card-content-title">Em andamento</p>
          <p className="card-number">{emAndamento}</p>
        </div>
        <div className="card">
          <p className="card-content-title">Concluídos</p>
          <p className="card-number">{concluidos}</p>
        </div>
      </div>

      <div className="bar-process">
        <p>Todos({total})</p>
        <p>Abertos({abertos})</p>
        <p>Em Andamento({emAndamento})</p>
        <p>Concluídos({concluidos})</p>
      </div>

      {projetos.map((projeto) => (
        <div className="box-project" key={projeto.id}>
          <div className="box-title">
            <h3>{projeto.titulo}</h3>
            <p className="status">{projeto.status}</p>
          </div>
          <p className="box-description">{projeto.descricao}</p>
          <div className="box-information">
            <p className="location">
              <span className="icon-location">
                <IoLocation />
              </span>
              {projeto.cidade}, {projeto.estado}
            </p>
            <p className="power">
              <span className="icon-power">
                <AiOutlineThunderbolt />
              </span>
              {projeto.potencia}kWp
            </p>
            <p className="data">{projeto.data}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
