import "../validacao-reputacao/estilo.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeaderInterface from "../header-interface";
import {
  AbasModulo,
  BuscaLateral,
  Composer,
  PerfilLateral,
  ProfissionaisCard,
  Toasts,
} from "../validacao-reputacao/Compartilhado";
import { useToasts } from "../validacao-reputacao/useToasts";

import { reputacaoService } from "../../../services/validacao";

/**
 * Módulo de Reputação — porte do #page-reputation do protótipo v3.
 *
 * As avaliações e as estatísticas vêm de GET /api/avaliacoes. O protótipo
 * trazia "4.9 / 27 avaliações / 98% / 92%" cravados no HTML; aqui o que
 * não dá para derivar dos dados reais simplesmente não é mostrado, em vez
 * de virar um número decorativo.
 */

const SINAIS = [
  "Projeto Verificado",
  "NR-10 válida",
  "NR-35 válida",
  "CREA vinculado",
  "Resposta rápida",
  "Avaliação 4.8+",
  "Sem retrabalho",
  "Portfólio consistente",
];

function estrelas(n) {
  const cheias = Math.round(n);
  return "★".repeat(cheias) + "☆".repeat(Math.max(0, 5 - cheias));
}

export default function ReputacaoInterface() {
  const navegar = useNavigate();
  const { toasts } = useToasts();

  const [avaliacoes, setAvaliacoes] = useState(null);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let vivo = true;
    reputacaoService
      .listar()
      .then((lista) => vivo && setAvaliacoes(lista))
      .catch((e) => {
        if (!vivo) return;
        setErro(e.message || "Não foi possível carregar suas avaliações.");
        setAvaliacoes([]);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const media = useMemo(() => {
    if (!avaliacoes?.length) return null;
    const soma = avaliacoes.reduce((t, a) => t + (a.estrelas || 0), 0);
    return soma / avaliacoes.length;
  }, [avaliacoes]);

  // Projeto verificado = avaliação amarrada a um projeto real. Avaliação
  // solta não conta: é exatamente a distinção que o módulo existe para fazer.
  const projetosVerificados = useMemo(
    () => new Set((avaliacoes || []).filter((a) => a.projetoId).map((a) => a.projetoId)).size,
    [avaliacoes],
  );

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return avaliacoes || [];
    return (avaliacoes || []).filter(
      (a) =>
        a.comentario?.toLowerCase().includes(termo) ||
        a.avaliador?.nome?.toLowerCase().includes(termo),
    );
  }, [avaliacoes, busca]);

  const carregando = avaliacoes === null;

  const estatisticas = [
    {
      rotulo: "Avaliação média",
      valor: media ? media.toFixed(1) : "—",
      detalhe: avaliacoes?.length
        ? `Baseada em ${avaliacoes.length} ${avaliacoes.length === 1 ? "avaliação" : "avaliações"}`
        : "Ainda sem avaliações",
    },
    {
      rotulo: "Projetos verificados",
      valor: projetosVerificados,
      detalhe: "Obras avaliadas dentro de um projeto",
    },
    {
      rotulo: "Avaliações recebidas",
      valor: avaliacoes?.length ?? "—",
      detalhe: "De parceiros que trabalharam com você",
    },
    {
      rotulo: "Notas 5 estrelas",
      valor: avaliacoes?.length
        ? `${Math.round((avaliacoes.filter((a) => a.estrelas === 5).length / avaliacoes.length) * 100)}%`
        : "—",
      detalhe: "Proporção das avaliações recebidas",
    },
  ];

  return (
    <div className="vr-pagina">
      <HeaderInterface />
      <AbasModulo />

      <main className="vr-container">
        <div className="vr-layout">
          <PerfilLateral
            sub="Histórico profissional"
            nota={
              <>
                Reputação cresce com <b>projetos verificados</b>, avaliações
                mútuas e credenciais válidas.
              </>
            }
          />

          <div className="vr-centro">
            <Composer
              convite="Compartilhe um projeto verificado…"
              acao="Publicar"
              aoAgir={() => navegar("/menu-user/portfolio")}
              meta={`${projetosVerificados} ${projetosVerificados === 1 ? "projeto verificado" : "projetos verificados"}`}
            />

            <ul className="vr-estatisticas">
              {estatisticas.map((e) => (
                <li key={e.rotulo} className="vr-estatistica">
                  <span>{e.rotulo}</span>
                  {carregando ? (
                    <div
                      className="eco-skeleton"
                      style={{ height: "2.8rem", marginTop: "0.8rem" }}
                    />
                  ) : (
                    <strong>{e.valor}</strong>
                  )}
                  <small>{e.detalhe}</small>
                </li>
              ))}
            </ul>

            <section className="vr-card vr-secao">
              <div className="vr-secao-cabecalho">
                <div>
                  <div className="vr-secao-titulo">Avaliações recentes</div>
                  <div className="vr-secao-sub">
                    Reputação vinculada a projetos reais, não a comentários soltos.
                  </div>
                </div>
              </div>

              {carregando && (
                <div className="vr-avaliacoes" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="vr-avaliacao">
                      <div className="eco-skeleton eco-skeleton--text" style={{ width: "55%" }} />
                      <div className="eco-skeleton eco-skeleton--text" style={{ width: "90%" }} />
                      <div className="eco-skeleton eco-skeleton--text" style={{ width: "72%" }} />
                    </div>
                  ))}
                </div>
              )}

              {!carregando && erro && (
                <p className="vr-vazio">
                  <strong>Não deu para carregar</strong>
                  {erro}
                </p>
              )}

              {!carregando && !erro && visiveis.length === 0 && (
                <p className="vr-vazio">
                  <strong>
                    {busca ? "Nada encontrado nesta busca" : "Nenhuma avaliação ainda"}
                  </strong>
                  {busca
                    ? "Tente outra palavra-chave."
                    : "Depois de concluir um projeto na plataforma, avaliem-se mutuamente — é assim que a reputação começa."}
                </p>
              )}

              {!carregando && visiveis.length > 0 && (
                <ul className="vr-avaliacoes">
                  {visiveis.map((a) => (
                    <li key={a.idAvaliacao} className="vr-avaliacao">
                      <div className="vr-avaliacao-topo">
                        <div>
                          <h4>
                            {a.avaliador?.nome || "Parceiro"}
                            {a.projetoId && ` • Projeto #${a.projetoId}`}
                          </h4>
                          <small>
                            {a.projetoId ? "Projeto verificado" : "Avaliação direta"}
                            {a.avaliador?.cidade &&
                              ` • ${a.avaliador.cidade}/${a.avaliador.estado || ""}`}
                          </small>
                        </div>
                        <div
                          className="vr-estrelas"
                          aria-label={`${a.estrelas} de 5 estrelas`}
                        >
                          {estrelas(a.estrelas)}
                        </div>
                      </div>
                      {a.comentario && <p>{a.comentario}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="vr-direita">
            <BuscaLateral
              titulo="Filtrar avaliações"
              valor={busca}
              aoMudar={setBusca}
              ajuda="Busque por parceiro ou pelo conteúdo do comentário."
            />

            <section className="vr-card vr-card-lateral">
              <h3>Sinais de confiança</h3>
              <div className="vr-nuvem-chips">
                {SINAIS.map((sinal) => (
                  <span key={sinal} className="eco-chip">
                    {sinal}
                  </span>
                ))}
              </div>
            </section>

            <ProfissionaisCard />
          </aside>
        </div>
      </main>

      <Toasts toasts={toasts} />
    </div>
  );
}
