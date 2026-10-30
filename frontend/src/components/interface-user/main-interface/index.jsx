import "./index.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconChevronRight, IconCircle } from "@tabler/icons-react";

import { useUserData } from "../../../useUserData";
import { projetosService } from "../../../services/projetos";
import { usuariosService } from "../../../services/usuarios";
import { reputacaoService, validacaoService } from "../../../services/validacao";
import EconomiaAnalise from "../../main/economia-analise";

const ROTULO_CREA = {
  VERIFICADA: "Verificado",
  PENDENTE: "Em conferência",
  REJEITADA: "Não aprovado",
  NAO_VINCULADA: "Não enviado",
};

function contarPortfolio() {
  try {
    const lista = JSON.parse(localStorage.getItem("portfolio") || "[]");
    return Array.isArray(lista) ? lista.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Painel profissional.
 *
 * Antes era quase todo fixo no código: um projeto "Sistema Comercial 15kWp,
 * Santos" que ninguém criou, "Progresso do perfil 60%" sempre igual e a frase
 * "seus documentos estão sendo validados" mesmo sem documento enviado.
 * Agora cada número e cada passo vem dos dados reais da conta.
 */
export default function MainInterface() {
  const { id, nome } = useUserData();
  const [dados, setDados] = useState(null);

  useEffect(() => {
    let ativo = true;
    // Uma falha isolada não derruba o painel: cada parte cai para "vazio".
    Promise.all([
      usuariosService.buscarPorId(id).catch(() => null),
      validacaoService.creaMinha().catch(() => null),
      reputacaoService.listar(id).catch(() => []),
      projetosService.listar().catch(() => []),
    ]).then(([eu, crea, avaliacoes, projetos]) => {
      if (!ativo) return;
      setDados({
        eu,
        crea: crea?.status || "NAO_VINCULADA",
        avaliacoes: Array.isArray(avaliacoes) ? avaliacoes : [],
        meusProjetos: (Array.isArray(projetos) ? projetos : []).filter(
          (p) => String(p.criador?.idUsuario) === String(id),
        ),
        portfolio: contarPortfolio(),
      });
    });
    return () => {
      ativo = false;
    };
  }, [id]);

  const primeiroNome = (nome || "").split(" ")[0];

  if (!dados) {
    return (
      <div className="pg">
        <h1 className="pg-titulo">Olá, {primeiroNome}</h1>
        <p className="eco-mudo">Carregando seu painel…</p>
      </div>
    );
  }

  const { eu, crea, avaliacoes, meusProjetos, portfolio } = dados;
  const media = avaliacoes.length
    ? (avaliacoes.reduce((s, a) => s + (a.estrelas || 0), 0) / avaliacoes.length).toFixed(1).replace(".", ",")
    : "—";

  // Passos que de fato mudam como a pessoa aparece para quem contrata.
  const passos = [
    { feito: Boolean(eu?.cidade && eu?.estado && eu?.tipoProfissional), texto: "Preencher cidade, estado e tipo de profissional", to: "/menu-user/settings" },
    { feito: crea === "VERIFICADA" || crea === "PENDENTE", texto: "Enviar seu registro CREA para conferência", to: "/menu-user/validacao" },
    { feito: portfolio > 0, texto: "Adicionar uma instalação ao portfólio", to: "/menu-user/portfolio" },
    { feito: avaliacoes.length > 0, texto: "Receber a primeira avaliação", to: "/menu-user/messages" },
  ];
  const feitos = passos.filter((p) => p.feito).length;
  const pct = Math.round((feitos / passos.length) * 100);

  return (
    <div className="pg">
      <header className="pg-cabeca">
        <div>
          <h1 className="pg-titulo">Olá, {primeiroNome}</h1>
          <p className="pg-sub">Seu painel profissional: como você aparece para quem contrata.</p>
        </div>
        <Link to="/menu-user/projects" className="eco-btn eco-btn--primary">Publicar projeto</Link>
      </header>

      <dl className="pg-metricas">
        <div><dt>Avaliação média</dt><dd>{media}</dd></div>
        <div><dt>Avaliações</dt><dd>{avaliacoes.length}</dd></div>
        <div><dt>Seus projetos</dt><dd>{meusProjetos.length}</dd></div>
        <div><dt>CREA</dt><dd className="painel-crea">{ROTULO_CREA[crea] || "—"}</dd></div>
      </dl>

      <div className="painel-grade">
        <section className="painel-card" aria-labelledby="titulo-passos">
          <div className="painel-card-cabeca">
            <h2 id="titulo-passos">Perfil completo</h2>
            <span className="painel-pct">{pct}%</span>
          </div>
          <div className="eco-progress painel-barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <ul className="painel-passos">
            {passos.map((p) => (
              <li key={p.texto} className={p.feito ? "is-feito" : ""}>
                {p.feito ? (
                  <IconCheck size={18} stroke={2} aria-label="Feito" />
                ) : (
                  <IconCircle size={18} stroke={1.6} aria-label="Pendente" />
                )}
                {p.feito ? (
                  <span>{p.texto}</span>
                ) : (
                  <Link to={p.to}>
                    {p.texto}
                    <IconChevronRight size={16} stroke={1.8} aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="painel-card" aria-labelledby="titulo-meus">
          <div className="painel-card-cabeca">
            <h2 id="titulo-meus">Seus projetos</h2>
            <Link to="/menu-user/projects" className="eco-link painel-ver">Ver todos</Link>
          </div>
          {meusProjetos.length === 0 ? (
            <p className="eco-mudo">Você ainda não publicou projetos.</p>
          ) : (
            <ul className="painel-projetos">
              {meusProjetos.slice(0, 4).map((p) => (
                <li key={p.idProjeto}>
                  <strong>{p.titulo}</strong>
                  <span>{[p.cidade, p.estado].filter(Boolean).join(", ")}{p.status ? ` · ${p.status}` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="painel-economia" aria-labelledby="titulo-economia">
        <div className="painel-card-cabeca painel-economia-cabeca">
          <h2 id="titulo-economia">Analisar conta de luz</h2>
          <Link to="/perfil" className="eco-link painel-ver">Histórico de análises</Link>
        </div>
        <div className="main-economia">
          <EconomiaAnalise />
        </div>
      </section>
    </div>
  );
}
