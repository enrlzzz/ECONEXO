import "./index.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconMapPin,
  IconRosetteDiscountCheck,
  IconSearch,
  IconStarFilled,
} from "@tabler/icons-react";

import ReputacaoProfissional from "./ReputacaoProfissional";
import { profissionaisService } from "../../../services/profissionais";
import { projetosService } from "../../../services/projetos";
import { avatarDe, regiaoDe, tipoProfissionalLabel } from "../../../format";

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

/**
 * Filtros da lateral. No computador ficam fixos ao lado dos resultados; no
 * celular abrem pelo botão "Filtros" (o campo de busca por nome fica sempre
 * visível, em cima — é o filtro mais usado).
 */
function Filtros({ form, ordem, onChange, onOrdem, onLimpar, mostrarProfissional }) {
  return (
    <form className="bus-filtros" onSubmit={(e) => e.preventDefault()}>
      {mostrarProfissional && (
        <div className="eco-field">
          <label htmlFor="tipo">Perfil</label>
          <select id="tipo" name="tipo" value={form.tipo} onChange={onChange}>
            {TIPOS.map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </div>
      )}

      <div className="eco-field">
        <label htmlFor="estado">Estado</label>
        <select id="estado" name="estado" value={form.estado} onChange={onChange}>
          <option value="">Todos os estados</option>
          {ESTADOS.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>
      </div>

      <div className="eco-field">
        <label htmlFor="cidade">Cidade</label>
        <input id="cidade" name="cidade" value={form.cidade} onChange={onChange} placeholder="Ex.: Sorocaba" />
      </div>

      {mostrarProfissional && (
        <div className="eco-field">
          <label htmlFor="ordem">Ordenar por</label>
          <select id="ordem" value={ordem} onChange={(e) => onOrdem(e.target.value)}>
            {ORDENS.map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </div>
      )}

      <button type="button" className="eco-btn eco-btn--texto bus-limpar" onClick={onLimpar}>
        Limpar filtros
      </button>
    </form>
  );
}

function Nota({ p }) {
  if (!p.totalAvaliacoes) return <span className="bus-nota bus-nota--vazia">Sem avaliações</span>;
  return (
    <span className="bus-nota">
      <IconStarFilled size={14} aria-hidden="true" />
      <strong>{p.mediaAvaliacoes.toFixed(1).replace(".", ",")}</strong>
      <span>
        ({p.totalAvaliacoes} avaliaç{p.totalAvaliacoes === 1 ? "ão" : "ões"})
      </span>
    </span>
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
  const [filtrosAbertos, setFiltrosAbertos] = useState(false); // só no celular
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
      .then((lista) => ativo && setProjetos(Array.isArray(lista) ? lista : []))
      .catch((e) => {
        if (!ativo) return;
        setErro(e.message || "Não foi possível carregar os projetos.");
        setProjetos([]);
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [tipoBusca]);

  function trocarTipo(tipo) {
    if (tipo === tipoBusca) return;
    setCarregando(true);
    setErro("");
    setTipoBusca(tipo);
  }

  const temFiltro = Object.values(form).some((v) => v);
  // Filtros da lateral em uso (o nome tem campo próprio, não conta aqui).
  const filtrosEmUso = ["estado", "cidade", "tipo"].filter((k) => form[k]).length;
  const projetosFiltrados = filtrarProjetos(projetos, form);
  const profissionais = useMemo(() => ordenar(resultados, ordem), [resultados, ordem]);
  const ehProf = tipoBusca === "profissionais";
  const total = ehProf ? profissionais.length : projetosFiltrados.length;

  return (
    <div className="pg">
      <header className="pg-cabeca">
        <div>
          <h1 className="pg-titulo">Buscar</h1>
          <p className="pg-sub">Encontre profissionais certificados e projetos abertos.</p>
        </div>

        <div className="eco-segmento bus-tipo" role="group" aria-label="O que buscar">
          <button type="button" aria-pressed={ehProf} onClick={() => trocarTipo("profissionais")}>
            Profissionais
          </button>
          <button type="button" aria-pressed={!ehProf} onClick={() => trocarTipo("projetos")}>
            Projetos
          </button>
        </div>
      </header>

      <div className="bus-barra">
        <label className="bus-campo">
          <IconSearch size={18} stroke={1.8} aria-hidden="true" />
          <span className="eco-sr-only">{ehProf ? "Buscar por nome" : "Buscar por título"}</span>
          <input
            type="search"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder={ehProf ? "Buscar por nome" : "Buscar por título do projeto"}
          />
        </label>

        <button
          type="button"
          className="eco-btn eco-btn--ghost bus-abrir-filtros"
          aria-expanded={filtrosAbertos}
          aria-controls="bus-lateral"
          onClick={() => setFiltrosAbertos((v) => !v)}
        >
          <IconAdjustmentsHorizontal size={18} stroke={1.8} aria-hidden="true" />
          Filtros{filtrosEmUso > 0 ? ` (${filtrosEmUso})` : ""}
        </button>
      </div>

      <div className="bus-corpo">
        <aside id="bus-lateral" className={`bus-lateral${filtrosAbertos ? " is-aberta" : ""}`} aria-label="Filtros">
          <Filtros
            form={form}
            ordem={ordem}
            onChange={handleChange}
            onOrdem={setOrdem}
            onLimpar={() => setForm(FORM_VAZIO)}
            mostrarProfissional={ehProf}
          />
        </aside>

        <section className="bus-resultados" aria-live="polite" aria-busy={carregando}>
          {erro && <p className="eco-alerta eco-alerta--erro" role="alert">{erro}</p>}

          {carregando ? (
            <p className="eco-mudo">Buscando…</p>
          ) : total === 0 ? (
            <div className="pg-vazio">
              <h2>
                {ehProf
                  ? temFiltro ? "Nenhum profissional encontrado" : "Ainda não há outros profissionais"
                  : projetos.length ? "Nenhum projeto encontrado" : "Ainda não há projetos publicados"}
              </h2>
              <p>
                {temFiltro
                  ? "Nada corresponde a esses filtros. Tente ampliar a busca."
                  : ehProf
                    ? "Quem criar conta e preencher cidade, estado e perfil aparece aqui."
                    : "Quando alguém publicar um projeto, ele aparece aqui."}
              </p>
              {temFiltro && (
                <button type="button" className="eco-btn eco-btn--ghost" onClick={() => setForm(FORM_VAZIO)}>
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="bus-total">
                {total} {ehProf ? (total === 1 ? "profissional" : "profissionais") : total === 1 ? "projeto" : "projetos"}
              </p>

              {ehProf ? (
                <ul className="bus-grade">
                  {profissionais.map((p) => {
                    const a = avatarDe(p);
                    const regiao = regiaoDe(p);
                    const cargo = tipoProfissionalLabel(p.tipoProfissional);
                    return (
                      <li key={p.idUsuario} className="bus-card">
                        <div className="bus-card-topo">
                          <span className="avatar" style={{ background: a.color }}>{a.initials}</span>
                          <div className="bus-card-nome">
                            <h2>{a.nome}</h2>
                            <p>{[cargo, regiao].filter(Boolean).join(" · ") || "Região não informada"}</p>
                          </div>
                        </div>

                        <div className="bus-card-sinais">
                          <Nota p={p} />
                          {p.creaVerificado && (
                            <span className="eco-badge eco-badge--ok">
                              <IconRosetteDiscountCheck size={14} stroke={1.8} aria-hidden="true" />
                              CREA verificado
                            </span>
                          )}
                        </div>

                        {/* Ação principal embaixo, larga; as secundárias como links. */}
                        <div className="bus-card-acoes">
                          <button
                            type="button"
                            className="eco-btn eco-btn--primary eco-btn--sm"
                            onClick={() => navigate(`/menu-user/messages?com=${p.idUsuario}`)}
                          >
                            Enviar mensagem
                          </button>
                          <div className="bus-card-links">
                            <button type="button" onClick={() => navigate(`/menu-user/profile?id=${p.idUsuario}`)}>
                              Ver perfil
                            </button>
                            <button type="button" onClick={() => setReputacaoDe(p)}>
                              Avaliações
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="bus-lista">
                  {projetosFiltrados.map((proj) => (
                    <li key={proj.idProjeto} className="bus-card bus-card--projeto">
                      <div className="bus-card-nome">
                        <h2>{proj.titulo}</h2>
                        {proj.descricao && <p className="bus-desc">{proj.descricao}</p>}
                      </div>
                      <ul className="bus-meta">
                        <li>
                          <IconMapPin size={16} stroke={1.6} aria-hidden="true" />
                          {[proj.cidade, proj.estado].filter(Boolean).join(", ") || "Local não informado"}
                        </li>
                        {proj.potenciaKwp != null && (
                          <li><IconBolt size={16} stroke={1.6} aria-hidden="true" />{proj.potenciaKwp} kWp</li>
                        )}
                        {proj.status && <li>{proj.status}</li>}
                      </ul>
                      {proj.criador && (
                        <button
                          type="button"
                          className="eco-btn eco-btn--ghost eco-btn--sm"
                          onClick={() => navigate(`/menu-user/messages?com=${proj.criador.idUsuario}`)}
                        >
                          Conversar com {proj.criador.nome.split(" ")[0]}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
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
