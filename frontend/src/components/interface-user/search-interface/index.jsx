import "./index.css";
import "/src/variables.css";

import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import HeaderInterface from "../header-interface";

import { LuFilter } from "react-icons/lu";
import { IoStarSharp } from "react-icons/io5";

const estados = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const instaladores = [
  {
    id: 1,
    nome: "João Santos",
    avaliacao: 4.9,
    avaliacoes: 8,
    cidade: "Campinas",
    estado: "SP",
    portfolio: [
      {
        id: 1,
        titulo: "Instalação Industrial Complexa",
        descricao: "Montagem de 100kWp em ambiente industrial",
        data: "31/03/2024",
        verificado: true,
      },
      {
        id: 2,
        titulo: "Sistema Comercial",
        descricao: "Instalação em telhado comercial",
        data: "14/03/2024",
        verificado: false,
      },
    ],
  },
  {
    id: 2,
    nome: "Pedro Costa",
    avaliacao: 4.6,
    avaliacoes: 10,
    cidade: "São José dos Campos",
    estado: "SP",
    portfolio: [],
  },
  {
    id: 3,
    nome: "Roberto Lima",
    avaliacao: 4.8,
    avaliacoes: 14,
    cidade: "Sorocaba",
    estado: "SP",
    portfolio: [],
  },
];

const projetos = [
  {
    id: 1,
    titulo: "Instalação Residencial 5kWp",
    descricao: "Sistema fotovoltaico residencial completo",
    cidade: "São Paulo",
    estado: "SP",
    potencia: "5",
    status: "Aberto",
    data: "09/04/2024",
  },
  {
    id: 2,
    titulo: "Sistema Comercial 15kWp",
    descricao: "Instalação para estabelecimento comercial",
    cidade: "Santos",
    estado: "SP",
    potencia: "15",
    status: "Em andamento",
    data: "04/04/2024",
  },
];

export default function Search() {
  const [tipoBusca, setTipoBusca] = useState("instaladores");
  const [form, setForm] = useState({
    nome: "",
    estado: "",
    cidade: "",
    raio: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const navigate = useNavigate();

  const Filtros = ({ placeholder }) => (
    <div className="search-filter">
      <div className="box-title-filter-search">
        <span className="filter-icon">
          <LuFilter />
        </span>
        <h3>Filtros de Busca</h3>
      </div>

      <form className="form-search">
        <label htmlFor="nome" className="label-nome">
          Buscar
        </label>
        <input
          type="text"
          placeholder={placeholder}
          id="nome"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
        />

        <label htmlFor="estado" className="label-name">
          Estado
        </label>
        <select
          id="estado"
          name="estado"
          value={form.estado}
          onChange={handleChange}
          required
        >
          <option value="">Todos os estados</option>
          {estados.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>

        <label htmlFor="cidade" className="label-name">
          Cidade
        </label>
        <input
          type="text"
          placeholder="Nome da cidade"
          id="cidade"
          name="cidade"
          value={form.cidade}
          onChange={handleChange}
          required
        />

        <label htmlFor="raio" className="label-name">
          Raio(km)
        </label>
        <select
          id="raio"
          name="raio"
          value={form.raio}
          onChange={handleChange}
          required
        >
          <option value="">Selecione</option>
          <option value="10km">10km</option>
          <option value="25km">25km</option>
          <option value="50km">50km</option>
          <option value="100km">100km</option>
          <option value="200km">200km</option>
          <option value="500km">500km</option>
        </select>
      </form>
    </div>
  );

  return (
    <div className="search-container">
      <HeaderInterface />

      <div className="search-header">
        <h2>Buscar</h2>
        <p>Encontre profissionais e projetos próximos a você</p>

        <div className="buttons-search-preference">
          <button
            type="button"
            className={tipoBusca === "instaladores" ? "ativo" : ""}
            onClick={() => setTipoBusca("instaladores")}
          >
            Instaladores
          </button>
          <button
            type="button"
            className={tipoBusca === "projetos" ? "ativo" : ""}
            onClick={() => setTipoBusca("projetos")}
          >
            Projetos
          </button>
        </div>

        {/* renderiza conteúdo diferente por aba */}
        {tipoBusca === "instaladores" && (
          <div>
            <Filtros placeholder="Nome do profissional" />

            <div className="search-results">
              <div className="instaladores-grid">
                {instaladores.map((inst) => (
                  <div className="card-instalador" key={inst.id}>
                    <div className="card-instalador-header">
                      <span className="avatar">{inst.nome.charAt(0)}</span>
                      <div>
                        <h3>{inst.nome}</h3>
                        <p>
                          <span className="stars-icon">
                            <IoStarSharp />
                          </span>{" "}
                          {inst.avaliacao} ({inst.avaliacoes} avaliações)
                        </p>
                      </div>
                    </div>
                    <p className="instalador-cidade">
                      {inst.cidade}, {inst.estado}
                    </p>
                    <p className="instalador-cert">NR-10 e NR-35</p>
                    <div className="card-instalador-btns">
                      <button
                        className="btn-perfil"
                        onClick={() =>
                          navigate("/menu-user/profile", { state: inst })
                        }
                      >
                        Ver Perfil
                      </button>

                      <Link to="/menu-user/messages">
                        <button className="btn-mensagen">Mensagem</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tipoBusca === "projetos" && (
          <div>
            <Filtros placeholder="Título do projeto" />

            <div className="search-results">
              <div className="projetos-list">
                {projetos.map((proj) => (
                  <div className="card-projeto-search" key={proj.id}>
                    <div className="card-projeo-header">
                      <h3>{proj.titulo}</h3>
                      <span className="status-badge">{proj.status}</span>
                    </div>
                    <p className="projeto-desc">{proj.descricao}</p>
                    <div className="projeto-info">
                      <div>
                        <p className="info-label">Localização</p>
                        <p className="info-value">
                          {proj.cidade}, {proj.estado}
                        </p>
                      </div>
                      <div>
                        <p className="info-label">Potência</p>
                        <p className="info-value">{proj.potencia} kWp</p>
                      </div>
                    </div>
                    <div className="card-projeto-btns">
                      <button className="btn-perfil-projeto">
                        Ver Detalhes
                      </button>
                      <Link to="/menu-user/messages">
                        <button className="btn-contatar">Contatar</button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
