import "./index.css";
import "/src/variables.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeaderInterface from "../header-interface";
import ReputacaoProfissional from "./ReputacaoProfissional";
import { profissionaisService } from "../../../services/profissionais";
import { projetosService } from "../../../services/projetos";
import { avatarDe, regiaoDe, tipoProfissionalLabel } from "../../../format";

import { LuFilter } from "react-icons/lu";
import { CiSearch } from "react-icons/ci";

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const TIPOS = [
  ["", "Todos os perfis"],
  ["INSTALADOR", "Instaladores"],
  ["PROJETISTA", "Projetistas"],
  ["TECNICO", "Técnicos"],
];

const ORDENS = [
  ["nome", "Nome (A–Z)"],
  ["reputacao", "Melhor avaliados"],
  ["verificados", "CREA verificado primeiro"],
];

const FORM_VAZIO = { nome: "", estado: "", cidade: "", tipo: "" };

function Filtros({ form, ordem, onChange, onOrdem, onLimpar, mostrarProfissional }) {
  return (
    <div className="search-filter">
      <div className="box-title-filter-search">
        <span className="filter-icon">
          <LuFilter />
        </span>
        <h3>Filtros de Busca</h3>
      </div>

      <form className="form-search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="nome" className="label-nome">
          Buscar
        </label>
        <input
          type="text"
          placeholder="Nome"
          id="nome"
          name="nome"
          value={form.nome}
          onChange={onChange}
        />

        {mostrarProfissional && (
          <>
            <label htmlFor="tipo" className="label-name">
              Perfil
            </label>
            <select id="tipo" name="tipo" value={form.tipo} onChange={onChange}>
              {TIPOS.map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="estado" className="label-name">
          Estado
        </label>
        <select id="estado" name="estado" value={form.estado} onChange={onChange}>
          <option value="">Todos os estados</option>
          {ESTADOS.map((uf) => (
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
          onChange={onChange}
        />

        {mostrarProfissional && (
          <>
            <label htmlFor="ordem" className="label-name">
              Ordenar por
            </label>
            <select id="ordem" value={ordem} onChange={(e) => onOrdem(e.target.value)}>
              {ORDENS.map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </>
        )}

        <button type="button" className="btn-limpar-filtros" onClick={onLimpar}>
          Limpar filtros
        </button>
      </form>
    </div>
  );
}

/**
 * Filtro de projetos feito no cliente sobre a lista real. A API de projetos
 * ainda não recebe parâmetros de busca e o volume é pequeno.
 */
function filtrarProjetos(projetos, form) {
  const nome = form.nome.trim().toLowerCase();
  const cidade = form.cidade.trim().toLowerCase();
  return projetos.filter((p) => {
    if (nome && !(p.titulo || "").toLowerCase().includes(nome)) return false;
    if (cidade && !(p.cidade || "").toLowerCase().includes(cidade)) return false;
    if (form.estado && p.estado !== form.estado) return false;
    return true;
  });
}

/** O servidor já ordena por nome; as outras ordens são feitas aqui. */
function ordenar(lista, ordem) {
  if (ordem === "nome") return lista;
  const copia = [...lista];
  if (ordem === "reputacao") {
    // Sem avaliação vai para o fim: "sem nota" não é "nota zero".
    copia.sort(
      (a, b) =>
        (b.mediaAvaliacoes ?? -1) - (a.mediaAvaliacoes ?? -1) ||
        b.totalAvaliacoes - a.totalAvaliacoes,
    );
  } else if (ordem === "verificados") {
    copia.sort((a, b) => Number(b.creaVerificado) - Number(a.creaVerificado));
  }
  return copia;
}

function Reputacao({ p }) {
  if (!p.totalAvaliacoes) {
    return <p className="instalador-reputacao instalador-reputacao--vazia">Sem avaliações</p>;
  }
  return (
    <p className="instalador-reputacao">
      <span className="stars-icon">★</span>{" "}
      <strong>{p.mediaAvaliacoes.toFixed(1).replace(".", ",")}</strong>{" "}
      <span>
        ({p.totalAvaliacoes} avaliaç{p.totalAvaliacoes === 1 ? "ão" : "ões"})
      </span>
    </p>
  );
}

export default function Search() {
  const navigate = useNavigate();

  const [tipoBusca, setTipoBusca] = useState("profissionais");
  const [form, setForm] = useState(FORM_VAZIO);
  const [ordem, setOrdem] = useState("nome");
  const [resultados, setResultados] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [reputacaoDe, setReputacaoDe] = useState(null); // profissional aberto no painel

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  };

  const buscar = useCallback(async (filtros) => {
    setCarregando(true);
    setErro("");
    try {
      const lista = await profissionaisService.buscar(filtros);
      setResultados(Array.isArray(lista) ? lista : []);
    } catch (e) {
      setErro(e.message || "Não foi possível carregar os profissionais.");
      setResultados([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Debounce: sem ele, cada tecla digitada dispararia uma requisição.
  useEffect(() => {
    if (tipoBusca !== "profissionais") return undefined;
    const timer = window.setTimeout(() => buscar(form), 350);
    return () => window.clearTimeout(timer);
  }, [form, buscar, tipoBusca]);

  useEffect(() => {
    if (tipoBusca !== "projetos") return undefined;
    let ativo = true;
    projetosService
      .listar()
      .then((lista) => {
        if (!ativo) return;
        setProjetos(Array.isArray(lista) ? lista : []);
      })
      .catch((e) => {
        if (!ativo) return;
        setErro(e.message || "Não foi possível carregar os projetos.");
        setProjetos([]);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [tipoBusca]);

  const temFiltro = Object.values(form).some((v) => v);
  const projetosFiltrados = filtrarProjetos(projetos, form);
  const profissionais = useMemo(() => ordenar(resultados, ordem), [resultados, ordem]);

  return (
    <div className="search-container">
      <HeaderInterface />

      <div className="search-header">
        <h2>Buscar</h2>
        <p>Encontre profissionais e projetos cadastrados na plataforma</p>

        <div className="buttons-search-preference">
          <button
            type="button"
            className={tipoBusca === "profissionais" ? "ativo" : ""}
            onClick={() => {
              setCarregando(true);
              setErro("");
              setTipoBusca("profissionais");
            }}
          >
            Profissionais
          </button>
          <button
            type="button"
            className={tipoBusca === "projetos" ? "ativo" : ""}
            onClick={() => {
              setCarregando(true);
              setErro("");
              setTipoBusca("projetos");
            }}
          >
            Projetos
          </button>
        </div>

        <Filtros
          form={form}
          ordem={ordem}
          onChange={handleChange}
          onOrdem={setOrdem}
          onLimpar={() => setForm(FORM_VAZIO)}
          mostrarProfissional={tipoBusca === "profissionais"}
        />

        {erro && <div className="search-erro">{erro}</div>}

        {tipoBusca === "projetos" && (
          <div className="search-results">
            {carregando ? (
              <p className="search-status">Buscando…</p>
            ) : projetosFiltrados.length === 0 ? (
              <div className="search-empty">
                <CiSearch />
                {projetos.length > 0 ? (
                  <>
                    <h3>Nenhum projeto encontrado</h3>
                    <p>Nenhum projeto corresponde a esses filtros.</p>
                  </>
                ) : (
                  <>
                    <h3>Ainda não há projetos publicados</h3>
                    <p>
                      Assim que alguém publicar um projeto em <strong>Projetos</strong>,
                      ele aparece aqui.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <p className="search-status">
                  {projetosFiltrados.length} projeto
                  {projetosFiltrados.length === 1 ? "" : "s"} encontrado
                  {projetosFiltrados.length === 1 ? "" : "s"}
                </p>
                <div className="projetos-list">
                  {projetosFiltrados.map((proj) => (
                    <div className="card-projeto-search" key={proj.idProjeto}>
                      <div className="card-projeo-header">
                        <h3>{proj.titulo}</h3>
                        {proj.status && <span className="status-badge">{proj.status}</span>}
                      </div>
                      <p className="projeto-desc">{proj.descricao}</p>
                      <div className="projeto-info">
                        <div>
                          <p className="info-label">Localização</p>
                          <p className="info-value">
                            {[proj.cidade, proj.estado].filter(Boolean).join(", ") ||
                              "Não informada"}
                          </p>
                        </div>
                        <div>
                          <p className="info-label">Potência</p>
                          <p className="info-value">
                            {proj.potenciaKwp != null
                              ? `${proj.potenciaKwp} kWp`
                              : "Não informada"}
                          </p>
                        </div>
                      </div>
                      {proj.criador && (
                        <div className="card-projeto-btns">
                          <button
                            className="btn-contatar"
                            onClick={() =>
                              navigate(`/menu-user/messages?com=${proj.criador.idUsuario}`)
                            }
                          >
                            Contatar {proj.criador.nome.split(" ")[0]}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tipoBusca === "profissionais" && (
          <div className="search-results">
            {carregando ? (
              <p className="search-status">Buscando…</p>
            ) : profissionais.length === 0 ? (
              <div className="search-empty">
                <CiSearch />
                {temFiltro ? (
                  <>
                    <h3>Nenhum profissional encontrado</h3>
                    <p>
                      Nenhum cadastro corresponde a esses filtros. Tente ampliar a
                      busca ou limpar os campos.
                    </p>
                  </>
                ) : (
                  <>
                    <h3>Ainda não há outros profissionais cadastrados</h3>
                    <p>
                      Assim que outras pessoas criarem conta e preencherem cidade,
                      estado e perfil profissional, elas aparecem aqui.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <>
                <p className="search-status">
                  {profissionais.length} profissiona{profissionais.length === 1 ? "l" : "is"}{" "}
                  encontrado{profissionais.length === 1 ? "" : "s"}
                </p>

                <div className="instaladores-grid">
                  {profissionais.map((p) => {
                    const a = avatarDe(p);
                    const regiao = regiaoDe(p);
                    const cargo = tipoProfissionalLabel(p.tipoProfissional);
                    return (
                      <div className="card-instalador" key={p.idUsuario}>
                        <div className="card-instalador-header">
                          <span className="avatar" style={{ background: a.color }}>
                            {a.initials}
                          </span>
                          <div>
                            <h3>{a.nome}</h3>
                            {cargo && <p className="instalador-tipo">{cargo}</p>}
                          </div>
                        </div>

                        <p className="instalador-cidade">{regiao || "Região não informada"}</p>

                        <Reputacao p={p} />

                        {p.creaVerificado && <span className="selo-crea">CREA verificado</span>}

                        <div className="card-instalador-btns">
                          <button
                            className="btn-perfil"
                            onClick={() => navigate(`/menu-user/profile?id=${p.idUsuario}`)}
                          >
                            Ver Perfil
                          </button>

                          <button className="btn-perfil" onClick={() => setReputacaoDe(p)}>
                            Reputação
                          </button>

                          <button
                            className="btn-mensagen"
                            onClick={() => navigate(`/menu-user/messages?com=${p.idUsuario}`)}
                          >
                            Mensagem
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {reputacaoDe && (
        <ReputacaoProfissional
          profissional={reputacaoDe}
          aoFechar={() => setReputacaoDe(null)}
          aoAvaliar={() => buscar(form)}
        />
      )}
    </div>
  );
}
