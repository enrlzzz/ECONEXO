import "../validacao-reputacao/estilo.css";

import { useEffect, useMemo, useState } from "react";

import { FiAward, FiCheck, FiClock, FiPlus } from "react-icons/fi";

import HeaderInterface from "../header-interface";
import { validacaoService } from "../../../services/validacao";
import DrawerValidacao from "../validacao-reputacao/DrawerValidacao";
import {
  AbasModulo,
  BuscaLateral,
  Composer,
  PerfilLateral,
  ProfissionaisCard,
  Toasts,
} from "../validacao-reputacao/Compartilhado";
import { useToasts } from "../validacao-reputacao/useToasts";

/**
 * Módulo de Validação — porte do #page-validation do protótipo v3.
 *
 * Uma diferença consciente em relação ao HTML: lá as credenciais nasciam
 * com "NR-10 Verificada" e "NR-35 Vence em breve" cravadas no markup. Num
 * protótipo isso ilustra o estado final; num produto seria a interface
 * afirmando que um documento foi conferido quando ninguém enviou nada.
 * Aqui as três nascem pendentes e mudam conforme a pessoa valida.
 */

const CHAVE = "econexo:credenciais";

/**
 * Como cada situação do CREA (vinda do servidor) aparece no cartão.
 * O selo de CREA NÃO é guardado no navegador: antes ele vivia no
 * localStorage e qualquer pessoa se marcava como verificada pelo DevTools.
 */
function aparenciaCrea(status) {
  switch (status) {
    case "VERIFICADA":
      return { status: "verificada", selo: "Verificada", acao: "Detalhes" };
    case "PENDENTE":
      return { status: "atencao", selo: "Em conferência", acao: "Detalhes" };
    case "REJEITADA":
      return { status: "atencao", selo: "Não aprovada", acao: "Reenviar" };
    default:
      return { status: "pendente", selo: "Não vinculado", acao: "Vincular" };
  }
}

const CREDENCIAIS_INICIAIS = [
  {
    id: "crea",
    marca: "C",
    nome: "CREA",
    descricao: "Registro profissional",
    status: "pendente",
    selo: "Não vinculado",
    extra: "Conferência da equipe",
    meta: [["Fonte", "Conselho da UF"], ["Conferência", "Administrador"]],
    acao: "Vincular",
  },
  {
    id: "nr10",
    marca: "10",
    nome: "NR-10",
    descricao: "Segurança em eletricidade",
    status: "pendente",
    selo: "Não enviada",
    extra: "Documental",
    meta: [["Carga horária", "40h"], ["Validade", "2 anos"]],
    acao: "Enviar",
  },
  {
    id: "nr35",
    marca: "35",
    nome: "NR-35",
    descricao: "Trabalho em altura",
    status: "pendente",
    selo: "Não enviada",
    extra: "Documental",
    meta: [["Carga horária", "8h"], ["Reciclagem", "Anual"]],
    acao: "Enviar",
  },
];

const FILTROS = [
  { id: "todas", rotulo: "Todas" },
  { id: "verificada", rotulo: "Verificadas" },
  { id: "atencao", rotulo: "Atenção" },
];

export default function ValidacaoInterface() {
  const { toasts, avisar } = useToasts();

  const [credenciais, setCredenciais] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (!salvo) return CREDENCIAIS_INICIAIS;
      // O CREA sempre começa "do zero" e é preenchido pelo servidor logo abaixo.
      return JSON.parse(salvo).map((c) =>
        c.id === "crea" ? CREDENCIAIS_INICIAIS[0] : c,
      );
    } catch {
      return CREDENCIAIS_INICIAIS;
    }
  });

  const [trilha, setTrilha] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [drawer, setDrawer] = useState(null); // null | tipo

  // Situação real do meu CREA, vinda do servidor.
  useEffect(() => {
    let vivo = true;
    validacaoService
      .creaMinha()
      .then((r) => {
        if (!vivo) return;
        const aparencia = aparenciaCrea(r?.status);
        setCredenciais((atuais) =>
          atuais.map((c) => (c.id === "crea" ? { ...c, ...aparencia } : c)),
        );
      })
      .catch(() => {
        // Sem resposta: o cartão fica como "Não vinculado" — nunca "verificado".
      });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(credenciais));
    } catch {
      // Modo privado ou storage cheio: a tela continua funcionando,
      // só não lembra do estado na próxima visita.
    }
  }, [credenciais]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return credenciais.filter((c) => {
      const passaFiltro = filtro === "todas" || c.status === filtro;
      const passaBusca =
        !termo ||
        c.nome.toLowerCase().includes(termo) ||
        c.descricao.toLowerCase().includes(termo);
      return passaFiltro && passaBusca;
    });
  }, [credenciais, filtro, busca]);

  const verificadas = credenciais.filter((c) => c.status === "verificada").length;
  const progresso = Math.round((verificadas / credenciais.length) * 100);
  const nivel = verificadas === 0 ? 1 : verificadas < credenciais.length ? 2 : 3;

  function registrarTrilha(titulo, texto, ok = true) {
    setTrilha((atual) => [
      { id: Date.now() + Math.random(), titulo, texto, ok, quando: new Date() },
      ...atual,
    ]);
  }

  function concluirValidacao({ tipo, resultado }) {
    if (!resultado) return;

    const vinculado = resultado.vinculado;

    // Envio que falhou (ERRO) não muda nada: nada foi gravado.
    if (tipo === "crea" && resultado.statusCrea === "ERRO") {
      avisar("Não foi possível enviar o CREA agora. Tente de novo.");
      return;
    }

    setCredenciais((atuais) =>
      atuais.map((c) => {
        if (c.id !== tipo) return c;
        if (tipo === "crea") return { ...c, ...aparenciaCrea(resultado.statusCrea) };
        return {
          ...c,
          status: vinculado ? "verificada" : "atencao",
          selo: vinculado ? "Verificada" : "Em revisão",
          acao: "Detalhes",
        };
      }),
    );

    const nome = tipo === "crea" ? "Registro CREA" : tipo.toUpperCase();

    if (tipo === "crea" && !vinculado) {
      registrarTrilha(
        "Registro CREA enviado para conferência",
        "Um administrador confere na consulta pública do conselho antes de liberar o selo.",
        false,
      );
      avisar("CREA enviado. Aguarde a conferência da equipe.", "↗");
    } else if (vinculado) {
      registrarTrilha(`${nome} vinculado`, "Consulta oficial concluída e evidência adicionada ao perfil.");
      avisar(`${nome} vinculado ao perfil.`);
    } else {
      registrarTrilha(
        `${nome} enviado para revisão`,
        "Análise automática concluída; caso adicionado à fila de revisão.",
        false,
      );
      avisar("Documento enviado para revisão final.", "↗");
    }
  }

  function exportarAuditoria() {
    const linhas = [
      "EcoNexo — Resumo de auditoria",
      "",
      ...credenciais.map((c) => `• ${c.nome}: ${c.selo}`),
      "",
      "Trilha:",
      ...(trilha.length
        ? trilha.map((t) => `• ${t.quando.toLocaleString("pt-BR")} — ${t.titulo}`)
        : ["• Nenhum evento registrado nesta sessão."]),
    ];

    const blob = new Blob([linhas.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "econexo-auditoria.txt";
    a.click();
    URL.revokeObjectURL(a.href);
    avisar("Resumo de auditoria exportado.");
  }

  return (
    <div className="vr-pagina">
      <HeaderInterface />
      <AbasModulo />

      <main className="vr-container">
        <div className="vr-layout">
          <PerfilLateral
            sub="Credenciais em validação"
            nota={
              <>
                Confiança na EcoNexo começa por <b>CREA e NRs verificáveis</b>,
                não por texto no perfil.
              </>
            }
          />

          <div className="vr-centro">
            <Composer
              convite="Envie uma certificação para validar…"
              acao="Validar"
              aoAgir={() => setDrawer("crea")}
              meta={`${credenciais.length} credenciais monitoradas`}
            />

            {/* ------------------- CREDENCIAIS ------------------- */}
            <section className="vr-card vr-secao">
              <div className="vr-secao-cabecalho">
                <div>
                  <div className="vr-secao-titulo">Validação de credenciais</div>
                  <div className="vr-secao-sub">
                    Foco do sistema: transformar CREA e NRs em confiança verificável.
                  </div>
                </div>

                <div className="vr-filtros" role="group" aria-label="Filtrar credenciais">
                  {FILTROS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`vr-filtro${filtro === f.id ? " ativo" : ""}`}
                      aria-pressed={filtro === f.id}
                      onClick={() => setFiltro(f.id)}
                    >
                      {f.rotulo}
                    </button>
                  ))}
                </div>
              </div>

              {visiveis.length === 0 ? (
                <p className="vr-vazio">
                  <strong>Nenhuma credencial neste filtro</strong>
                  Troque o filtro ou limpe a busca para ver as outras.
                </p>
              ) : (
                <ul className="vr-credenciais">
                  {visiveis.map((c) => (
                    <li key={c.id} className="vr-credencial">
                      <span className={`vr-cred-icone ${c.id}`} aria-hidden="true">
                        {c.marca}
                      </span>

                      <div className="vr-cred-principal">
                        <div className="vr-cred-titulo">
                          <strong>{c.nome}</strong>
                          <span
                            className={`eco-badge ${
                              c.status === "verificada"
                                ? "eco-badge--ok"
                                : c.status === "atencao"
                                  ? "eco-badge--warn"
                                  : "eco-badge--muted"
                            }`}
                          >
                            {c.selo}
                          </span>
                          <span className="eco-badge eco-badge--info">{c.extra}</span>
                        </div>

                        <div className="vr-cred-meta">
                          <span>{c.descricao}</span>
                          {c.meta.map(([rotulo, valor]) => (
                            <span key={rotulo}>
                              {rotulo}: <b>{valor}</b>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="vr-cred-acoes">
                        <button
                          type="button"
                          className={`vr-btn-pequeno${c.status === "pendente" ? " primario" : ""}`}
                          onClick={() => setDrawer(c.id)}
                        >
                          {c.acao}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ------------------- TRILHA ------------------- */}
            <section className="vr-card vr-secao">
              <div className="vr-secao-cabecalho">
                <div>
                  <div className="vr-secao-titulo">Trilha de auditoria</div>
                  <div className="vr-secao-sub">
                    Toda decisão deixa rastro, horário e evidência.
                  </div>
                </div>
                <button type="button" className="eco-btn eco-btn--light" onClick={exportarAuditoria}>
                  Exportar
                </button>
              </div>

              {trilha.length === 0 ? (
                <p className="vr-vazio">
                  <strong>Nenhum evento ainda</strong>
                  Cada validação concluída aparece aqui com horário e origem.
                </p>
              ) : (
                <ul className="vr-trilha">
                  {trilha.map((t) => (
                    <li key={t.id} className="vr-trilha-item">
                      <span className={`vr-ponto${t.ok ? " ok" : ""}`} aria-hidden="true">
                        {t.ok ? <FiCheck /> : <FiClock />}
                      </span>
                      <div className="vr-trilha-copy">
                        <strong>{t.titulo}</strong>
                        <p>{t.texto}</p>
                        <time dateTime={t.quando.toISOString()}>
                          {t.quando.toLocaleString("pt-BR")}
                        </time>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* ------------------- COLUNA DIREITA ------------------- */}
          <aside className="vr-direita">
            <BuscaLateral
              titulo="Filtrar validação"
              valor={busca}
              aoMudar={setBusca}
              ajuda="Busque por credencial, conselho ou tipo de conferência."
            />

            <section className="vr-card vr-card-lateral">
              <div className="vr-pilha" style={{ marginTop: 0 }}>
                <div className="vr-micro-card">
                  <div className="vr-micro-topo">
                    <strong>Perfil verificável</strong>
                    <span className="eco-badge eco-badge--info">Nível {nivel}</span>
                  </div>
                  <div
                    className="eco-progress"
                    role="progressbar"
                    aria-valuenow={progresso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progresso do perfil verificável"
                  >
                    <span style={{ "--valor": `${progresso}%` }} />
                  </div>
                  <div className="vr-micro-linha">
                    <span>{progresso}% concluído</span>
                    <span>Meta 100%</span>
                  </div>
                </div>

                <div className="vr-alerta">
                  <span className="vr-alerta-icone" aria-hidden="true">
                    <FiPlus />
                  </span>
                  <div>
                    <strong>Complete suas credenciais</strong>
                    <p>
                      Faltam {credenciais.length - verificadas} de {credenciais.length}.
                      Perfil completo aparece antes na busca.
                    </p>
                  </div>
                </div>

                <div className="vr-alerta">
                  <span className="vr-alerta-icone info" aria-hidden="true">
                    <FiAward />
                  </span>
                  <div>
                    <strong>Reputação anda junto</strong>
                    <p>
                      Credencial válida + projeto verificado é o que gera o selo
                      de confiança no portfólio.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <ProfissionaisCard />
          </aside>
        </div>
      </main>

      {drawer && (
        <DrawerValidacao
          tipoInicial={drawer}
          aoFechar={() => setDrawer(null)}
          aoConcluir={concluirValidacao}
          avisar={avisar}
        />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}
