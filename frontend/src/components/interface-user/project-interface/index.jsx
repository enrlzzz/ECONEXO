import "./index.css";
import "/src/variables.css";

import { useEffect, useState } from "react";

import { FiPlus } from "react-icons/fi";
import { IoLocation } from "react-icons/io5";
import { AiOutlineThunderbolt } from "react-icons/ai";

import HeaderInterface from "../header-interface";
import { projetosService } from "../../../services/projetos";

const ESTADOS = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"],
  ["BA", "Bahia"], ["CE", "Ceará"], ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"], ["GO", "Goiás"], ["MA", "Maranhão"],
  ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"],
  ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"], ["PE", "Pernambuco"],
  ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"],
  ["SC", "Santa Catarina"], ["SP", "São Paulo"], ["SE", "Sergipe"],
  ["TO", "Tocantins"],
];

const FORM_VAZIO = {
  titulo: "",
  descricao: "",
  cidade: "",
  estado: "",
  potenciaKwp: "",
};

export default function ProjectInterface() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);

  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    projetosService
      .listar()
      .then((lista) => {
        if (ativo) setProjetos(Array.isArray(lista) ? lista : []);
      })
      .catch((e) => {
        if (ativo) setErro(e.message || "Não foi possível carregar os projetos.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const handlePublicar = async (event) => {
    event.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const criado = await projetosService.criar({
        titulo: form.titulo,
        descricao: form.descricao,
        cidade: form.cidade,
        estado: form.estado,
        // O input é texto e o backend espera número: converte aqui e manda
        // null quando vazio, em vez de "" (que quebraria a validação).
        potenciaKwp: form.potenciaKwp ? Number(form.potenciaKwp) : null,
        status: "Aberto",
      });
      setProjetos((atuais) => [criado, ...atuais]);
      setMostrarModal(false);
      setForm(FORM_VAZIO);
    } catch (e) {
      setErro(e.message || "Não foi possível publicar o projeto.");
    } finally {
      setSalvando(false);
    }
  };

  const total = projetos.length;
  const abertos = projetos.filter((p) => p.status === "Aberto").length;
  const emAndamento = projetos.filter((p) => p.status === "Em andamento").length;
  const concluidos = projetos.filter((p) => p.status === "Concluído").length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  };

  return (
    <div className="project-interface-container">
      <HeaderInterface />

      <div className="project-content">
        <div className="content-header">
          <h2>Projetos</h2>
          <button className="projects-btn" onClick={() => setMostrarModal(true)}>
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
                    id="titulo"
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
                    id="descricao"
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
                    id="cidade"
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
                    {ESTADOS.map(([uf, nome]) => (
                      <option key={uf} value={uf}>
                        {nome}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="potenciaKwp" className="label-name">
                    Potência (kWp)
                  </label>
                  <input
                    type="number"
                    id="potenciaKwp"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 10"
                    name="potenciaKwp"
                    value={form.potenciaKwp}
                    onChange={handleChange}
                    required
                  />
                  <button type="submit" disabled={salvando}>
                    {salvando ? "Publicando…" : "Publicar"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        <p>Gerencie seus projetos e encontre instaladores</p>
      </div>

      {erro && <div className="project-erro">{erro}</div>}

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

      {carregando ? (
        <p className="project-status">Carregando projetos…</p>
      ) : projetos.length === 0 ? (
        <div className="project-empty">
          <h3>Nenhum projeto publicado</h3>
          <p>
            Ainda não há projetos na plataforma. Clique em{" "}
            <strong>Novo Projeto</strong> para publicar o primeiro e receber
            contato de instaladores.
          </p>
        </div>
      ) : (
        projetos.map((projeto) => (
          <div className="box-project" key={projeto.idProjeto}>
            <div className="box-title">
              <h3>{projeto.titulo}</h3>
              <p className="status">{projeto.status}</p>
            </div>
            <p className="box-description">{projeto.descricao}</p>
            <div className="box-information">
              {(projeto.cidade || projeto.estado) && (
                <p className="location">
                  <span className="icon-location">
                    <IoLocation />
                  </span>
                  {[projeto.cidade, projeto.estado].filter(Boolean).join(", ")}
                </p>
              )}
              {projeto.potenciaKwp != null && (
                <p className="power">
                  <span className="icon-power">
                    <AiOutlineThunderbolt />
                  </span>
                  {projeto.potenciaKwp}kWp
                </p>
              )}
              {projeto.criador?.nome && (
                <p className="data">por {projeto.criador.nome}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
