import "./index.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconBolt, IconMapPin, IconPlus, IconX } from "@tabler/icons-react";

import { projetosService } from "../../../services/projetos";
import { getUser } from "../../../userSession";

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

const FORM_VAZIO = { titulo: "", descricao: "", cidade: "", estado: "", potenciaKwp: "" };

/**
 * O status chega como texto livre ("Aberto", "Em andamento", "Concluído").
 * normalizar() deixa a comparação imune a caixa e acento, para um status
 * gravado como "EM_ANDAMENTO" ou "concluido" cair no filtro certo.
 */
const normalizar = (s) =>
  (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/_/g, " ").trim().toLowerCase();

const FILTROS = [
  { id: "todos", rotulo: "Todos", aceita: () => true },
  { id: "aberto", rotulo: "Abertos", aceita: (p) => normalizar(p.status) === "aberto" },
  { id: "andamento", rotulo: "Em andamento", aceita: (p) => normalizar(p.status) === "em andamento" },
  { id: "concluido", rotulo: "Concluídos", aceita: (p) => normalizar(p.status) === "concluido" },
];

const SELO = { aberto: "eco-badge--ok", "em andamento": "eco-badge--info", concluido: "eco-badge--muted" };

/** "EM_ANDAMENTO" -> "Em andamento"; o que já vier bonito fica como está. */
function rotuloStatus(status) {
  const n = normalizar(status);
  if (!n) return "";
  if (n === "concluido") return "Concluído";
  return n.charAt(0).toUpperCase() + n.slice(1);
}

export default function ProjectInterface() {
  const navigate = useNavigate();
  const meuId = Number(getUser()?.id);

  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [soMeus, setSoMeus] = useState(false);

  const [dialogo, setDialogo] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  useEffect(() => {
    let ativo = true;
    projetosService
      .listar()
      .then((lista) => ativo && setProjetos(Array.isArray(lista) ? lista : []))
      .catch((e) => ativo && setErro(e.message || "Não foi possível carregar os projetos."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  // Esc fecha o diálogo.
  useEffect(() => {
    if (!dialogo) return undefined;
    const aoTeclar = (e) => e.key === "Escape" && setDialogo(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [dialogo]);

  const ehMeu = (p) => p.criador?.idUsuario === meuId;
  const base = soMeus ? projetos.filter(ehMeu) : projetos;
  const contagem = Object.fromEntries(FILTROS.map((f) => [f.id, base.filter(f.aceita).length]));
  const visiveis = base.filter(FILTROS.find((f) => f.id === filtro).aceita);

  const handleChange = (e) => setForm((atual) => ({ ...atual, [e.target.name]: e.target.value }));

  async function publicar(e) {
    e.preventDefault();
    setSalvando(true);
    setErroForm("");
    try {
      const criado = await projetosService.criar({
        titulo: form.titulo,
        descricao: form.descricao,
        cidade: form.cidade,
        estado: form.estado,
        // O backend espera número: manda null quando vazio, não "".
        potenciaKwp: form.potenciaKwp ? Number(form.potenciaKwp) : null,
        status: "Aberto",
      });
      setProjetos((atuais) => [criado, ...atuais]);
      setDialogo(false);
      setForm(FORM_VAZIO);
    } catch (ex) {
      setErroForm(ex.message || "Não foi possível publicar o projeto.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(projeto) {
    if (!window.confirm(`Excluir o projeto "${projeto.titulo}"? Isso não pode ser desfeito.`)) return;
    setErro("");
    try {
      await projetosService.excluir(projeto.idProjeto);
      setProjetos((atuais) => atuais.filter((p) => p.idProjeto !== projeto.idProjeto));
    } catch (ex) {
      setErro(ex.message || "Não foi possível excluir o projeto.");
    }
  }

  return (
    <div className="pg">
      <header className="pg-cabeca">
        <div>
          <h1 className="pg-titulo">Projetos</h1>
          <p className="pg-sub">Publique um projeto e encontre instaladores qualificados.</p>
        </div>
        <button type="button" className="eco-btn eco-btn--primary" onClick={() => setDialogo(true)}>
          <IconPlus size={18} stroke={2} aria-hidden="true" />
          Novo projeto
        </button>
      </header>

      <dl className="pg-metricas">
        <div><dt>Total</dt><dd>{contagem.todos}</dd></div>
        <div><dt>Abertos</dt><dd>{contagem.aberto}</dd></div>
        <div><dt>Em andamento</dt><dd>{contagem.andamento}</dd></div>
        <div><dt>Concluídos</dt><dd>{contagem.concluido}</dd></div>
      </dl>

      <div className="proj-barra">
        <div className="pg-abas" role="group" aria-label="Filtrar por situação">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.rotulo}
              <span>{contagem[f.id]}</span>
            </button>
          ))}
        </div>

        <label className="proj-meus">
          <input type="checkbox" checked={soMeus} onChange={(e) => setSoMeus(e.target.checked)} />
          Só os meus
        </label>
      </div>

      {erro && <p className="eco-alerta eco-alerta--erro" role="alert">{erro}</p>}

      {carregando ? (
        <p className="eco-mudo">Carregando projetos…</p>
      ) : visiveis.length === 0 ? (
        <div className="pg-vazio">
          <h2>{projetos.length ? "Nenhum projeto neste filtro" : "Nenhum projeto publicado"}</h2>
          <p>
            {projetos.length
              ? "Troque o filtro acima para ver os outros projetos."
              : "Publique o primeiro projeto e receba contato de instaladores da sua região."}
          </p>
          {!projetos.length && (
            <button type="button" className="eco-btn eco-btn--primary" onClick={() => setDialogo(true)}>
              Publicar projeto
            </button>
          )}
        </div>
      ) : (
        <ul className="proj-lista">
          {visiveis.map((p) => {
            const meu = ehMeu(p);
            const local = [p.cidade, p.estado].filter(Boolean).join(", ");
            return (
              <li key={p.idProjeto} className="proj-card">
                <div className="proj-card-topo">
                  <h2>{p.titulo}</h2>
                  {p.status && (
                    <span className={`eco-badge ${SELO[normalizar(p.status)] || "eco-badge--muted"}`}>
                      {rotuloStatus(p.status)}
                    </span>
                  )}
                </div>

                {p.descricao && <p className="proj-card-desc">{p.descricao}</p>}

                <div className="proj-card-rodape">
                  <ul className="proj-card-meta">
                    {local && (
                      <li><IconMapPin size={16} stroke={1.6} aria-hidden="true" />{local}</li>
                    )}
                    {p.potenciaKwp != null && (
                      <li><IconBolt size={16} stroke={1.6} aria-hidden="true" />{p.potenciaKwp} kWp</li>
                    )}
                    {p.criador?.nome && <li>{meu ? "Publicado por você" : `por ${p.criador.nome}`}</li>}
                  </ul>

                  {meu ? (
                    <button type="button" className="eco-btn eco-btn--texto eco-btn--sm proj-excluir" onClick={() => excluir(p)}>
                      Excluir
                    </button>
                  ) : (
                    p.criador && (
                      <button
                        type="button"
                        className="eco-btn eco-btn--ghost eco-btn--sm"
                        onClick={() => navigate(`/menu-user/messages?com=${p.criador.idUsuario}`)}
                      >
                        Conversar com {p.criador.nome.split(" ")[0]}
                      </button>
                    )
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {dialogo && (
        <div className="pg-dialogo-fundo" onClick={(e) => e.target === e.currentTarget && setDialogo(false)}>
          <div className="pg-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-novo-projeto">
            <div className="pg-dialogo-cabeca">
              <div>
                <h2 id="titulo-novo-projeto">Novo projeto</h2>
                <p>Instaladores da região veem o projeto e podem te chamar.</p>
              </div>
              <button type="button" className="pg-fechar" onClick={() => setDialogo(false)} aria-label="Fechar">
                <IconX size={18} aria-hidden="true" />
              </button>
            </div>

            <form className="pg-form" onSubmit={publicar}>
              <div className="eco-field pg-form-inteiro">
                <label htmlFor="titulo">Título</label>
                <input id="titulo" name="titulo" value={form.titulo} onChange={handleChange}
                  placeholder="Ex.: Residencial 10 kWp em telhado cerâmico" required autoFocus />
              </div>

              <div className="eco-field pg-form-inteiro">
                <label htmlFor="descricao">Descrição</label>
                <textarea id="descricao" name="descricao" rows={4} value={form.descricao} onChange={handleChange}
                  placeholder="Escopo, tipo de telhado, padrão de entrada, certificações exigidas…" required />
              </div>

              <div className="eco-field">
                <label htmlFor="cidade">Cidade</label>
                <input id="cidade" name="cidade" value={form.cidade} onChange={handleChange} placeholder="Ex.: Sorocaba" required />
              </div>

              <div className="eco-field">
                <label htmlFor="estado">Estado</label>
                <select id="estado" name="estado" value={form.estado} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  {ESTADOS.map(([uf, nome]) => (
                    <option key={uf} value={uf}>{nome}</option>
                  ))}
                </select>
              </div>

              <div className="eco-field">
                <label htmlFor="potenciaKwp">Potência (kWp)</label>
                <input id="potenciaKwp" name="potenciaKwp" type="number" step="0.01" min="0"
                  value={form.potenciaKwp} onChange={handleChange} placeholder="Ex.: 10" required />
              </div>

              {erroForm && <p className="eco-alerta eco-alerta--erro pg-form-inteiro" role="alert">{erroForm}</p>}

              <div className="pg-dialogo-acoes">
                <button type="button" className="eco-btn eco-btn--ghost" onClick={() => setDialogo(false)}>
                  Cancelar
                </button>
                <button type="submit" className="eco-btn eco-btn--primary" disabled={salvando} aria-busy={salvando}>
                  {salvando ? "Publicando…" : "Publicar projeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
