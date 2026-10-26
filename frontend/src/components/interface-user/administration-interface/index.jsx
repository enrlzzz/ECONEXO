import "./index.css";
import "/src/variables.css";

import { useEffect, useState } from "react";
import HeaderInterface from "../header-interface";
import { validacaoService } from "../../../services/validacao";

import { MdOutlineShield } from "react-icons/md";
import { MdOutlineAccessTime } from "react-icons/md";
import { MdOutlineCheckCircle } from "react-icons/md";
import { MdOutlineCancel } from "react-icons/md";
import { MdOutlinePerson } from "react-icons/md";
import { MdOutlineDescription } from "react-icons/md";
import { BsExclamationCircle } from "react-icons/bs";

/**
 * Fila de conferência de CREA.
 *
 * Cada item é uma solicitação REAL (tabela credencial_crea): o profissional
 * informou nome, registro e UF, e alguém precisa conferir isso na consulta
 * pública do conselho antes de o selo "CREA verificado" ser liberado.
 *
 * A rota exige a flag admin, mas quem de fato autoriza é o backend — um
 * usuário comum que chegasse aqui receberia 403 em todas as chamadas.
 *
 * Esta tela só lista o que está PENDENTE (o que já foi decidido sai da fila).
 * Aprovados e rejeitados mostrados aqui valem apenas para esta sessão.
 */

const CHECKLIST = [
  "O nome na consulta pública confere com o informado",
  "O número do registro e a UF conferem",
  "A situação do registro está ativa/regular",
];

const formatarData = (iso) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";

export default function Administration() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("Pendentes");
  const [modalAberto, setModalAberto] = useState(null); // item selecionado
  const [marcados, setMarcados] = useState([]); // checklist do item aberto
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vivo = true;
    validacaoService
      .creaPendentes()
      .then((itens) => {
        if (!vivo) return;
        setLista(
          (Array.isArray(itens) ? itens : []).map((i) => ({
            ...i,
            status: "Pendente",
          })),
        );
      })
      .catch((e) => {
        if (vivo) setErro(e.message || "Não foi possível carregar a fila.");
      })
      .finally(() => {
        if (vivo) setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const pendentes = lista.filter((c) => c.status === "Pendente").length;
  const aprovados = lista.filter((c) => c.status === "Aprovado").length;
  const rejeitados = lista.filter((c) => c.status === "Rejeitado").length;
  const total = lista.length;

  const filtrarLista = () => {
    if (filtro === "Todos") return lista;
    const alvo = { Pendentes: "Pendente", Aprovados: "Aprovado", Rejeitados: "Rejeitado" }[filtro];
    return lista.filter((c) => c.status === alvo);
  };

  const abrirRevisao = (item) => {
    setModalAberto(item);
    setMarcados([]);
    setObservacao("");
    setErro("");
  };

  async function decidir(aprovada) {
    if (!aprovada && !observacao.trim()) {
      setErro("Explique o motivo da rejeição — o profissional vai ler.");
      return;
    }

    setEnviando(true);
    setErro("");
    try {
      await validacaoService.creaDecidir(
        modalAberto.idCredencial,
        aprovada,
        observacao.trim(),
      );
      setLista((atual) =>
        atual.map((c) =>
          c.idCredencial === modalAberto.idCredencial
            ? { ...c, status: aprovada ? "Aprovado" : "Rejeitado" }
            : c,
        ),
      );
      setModalAberto(null);
    } catch (e) {
      setErro(e.message || "Não foi possível registrar a decisão.");
    } finally {
      setEnviando(false);
    }
  }

  const statusColor = (status) => {
    if (status === "Pendente") return "status-pendente";
    if (status === "Aprovado") return "status-aprovado";
    if (status === "Rejeitado") return "status-rejeitado";
    return "";
  };

  const tudoConferido = marcados.length === CHECKLIST.length;

  return (
    <div className="admin-panel">
      <HeaderInterface />

      <div className="admin-content">
        {/* header */}
        <div className="admin-header">
          <div className="admin-title-row">
            <span className="admin-shield-icon">
              <MdOutlineShield />
            </span>
            <div>
              <h2>Painel Administrativo</h2>
              <p>Conferência de registros CREA</p>
            </div>
          </div>
        </div>

        {/* cards */}
        <div className="admin-cards">
          <div className="admin-card">
            <div className="admin-card-title">
              <MdOutlineAccessTime /> Pendentes
            </div>
            <p className="admin-card-number pendente">{pendentes}</p>
          </div>
          <div className="admin-card">
            <div className="admin-card-title">
              <MdOutlineCheckCircle /> Aprovados
            </div>
            <p className="admin-card-number aprovado">{aprovados}</p>
          </div>
          <div className="admin-card">
            <div className="admin-card-title">
              <MdOutlineCancel /> Rejeitados
            </div>
            <p className="admin-card-number rejeitado">{rejeitados}</p>
          </div>
          <div className="admin-card">
            <div className="admin-card-title">
              <MdOutlinePerson /> Total
            </div>
            <p className="admin-card-number total">{total}</p>
          </div>
        </div>

        {erro && !modalAberto && (
          <div className="admin-alert" role="alert">
            <BsExclamationCircle className="alert-icon" />
            <div>
              <h3>Algo deu errado</h3>
              <p>{erro}</p>
            </div>
          </div>
        )}

        {/* aviso pendentes */}
        {pendentes > 0 && (
          <div className="admin-alert">
            <BsExclamationCircle className="alert-icon" />
            <div>
              <h3>Validações Pendentes</h3>
              <p>
                Você tem {pendentes} registro(s) CREA aguardando conferência.
                Confira cada um na consulta pública do conselho e aprove ou
                rejeite.
              </p>
            </div>
          </div>
        )}

        {/* filtros */}
        <div className="admin-filters">
          {["Pendentes", "Aprovados", "Rejeitados", "Todos"].map((f) => (
            <button
              key={f}
              className={filtro === f ? "filter-btn ativo" : "filter-btn"}
              onClick={() => setFiltro(f)}
            >
              {f} (
              {f === "Pendentes"
                ? pendentes
                : f === "Aprovados"
                  ? aprovados
                  : f === "Rejeitados"
                    ? rejeitados
                    : total}
              )
            </button>
          ))}
        </div>

        {/* lista */}
        <div className="admin-list">
          {carregando && <p>Carregando…</p>}

          {!carregando && filtrarLista().length === 0 && (
            <div className="admin-empty">
              <MdOutlineShield />
              <h3>Nenhum registro na fila</h3>
              <p>
                Quando um profissional enviar o CREA para verificação, a
                solicitação aparece aqui.
              </p>
            </div>
          )}

          {filtrarLista().map((cert) => (
            <div className="cert-card" key={cert.idCredencial}>
              <div className="cert-card-header">
                <div className="cert-user-info">
                  <span className="cert-avatar">{cert.nomeUsuario.charAt(0)}</span>
                  <div className="info-avatar">
                    <h3>{cert.nomeUsuario}</h3>
                    <p>
                      CREA-{cert.uf} • registro {cert.registro}
                    </p>
                    <p className="cert-location">
                      Nome informado no registro: {cert.nomeRegistro}
                    </p>
                  </div>
                </div>
                <span className={`cert-status ${statusColor(cert.status)}`}>
                  {cert.status}
                </span>
              </div>

              <div className="cert-docs">
                <p className="cert-docs-title">Conferir na fonte oficial:</p>
                <div className="cert-doc-row">
                  <span>
                    <MdOutlineDescription /> Consulta pública do CREA-{cert.uf}
                  </span>
                  <a
                    className="btn-visualizar"
                    href={cert.fonte}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir site
                  </a>
                </div>
              </div>

              <p className="cert-data">Enviado em {formatarData(cert.criadoEm)}</p>

              {cert.status === "Pendente" && (
                <div className="cert-actions">
                  <button className="btn-revisar" onClick={() => abrirRevisao(cert)}>
                    Revisar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* modal revisar */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-revisar">
            <div className="modal-revisar-header">
              <div>
                <h3>Revisar registro CREA</h3>
                <p>Confira os dados de {modalAberto.nomeUsuario}</p>
              </div>
              <span className="close" onClick={() => setModalAberto(null)}>
                ✕
              </span>
            </div>

            <div className="modal-user-card">
              <span className="cert-avatar">{modalAberto.nomeUsuario.charAt(0)}</span>
              <div>
                <h3>{modalAberto.nomeRegistro}</h3>
                <p>
                  Registro {modalAberto.registro} • CREA-{modalAberto.uf}
                </p>
                <p>Enviado em {formatarData(modalAberto.criadoEm)}</p>
              </div>
            </div>

            <div className="modal-doc-row">
              <span className="modal-doc-icon">
                <MdOutlineDescription />
              </span>
              <div>
                <p>Consulta pública do CREA-{modalAberto.uf}</p>
                <p className="doc-filename">Busque o profissional pelo nome ou pelo registro</p>
              </div>
              <a
                className="btn-visualizar-pdf"
                href={modalAberto.fonte}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir site
              </a>
            </div>

            <div className="checklist">
              <h4>Checklist de conferência</h4>
              {CHECKLIST.map((item, i) => (
                <label key={item} style={{ display: "flex", gap: "0.8rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={marcados.includes(i)}
                    onChange={() =>
                      setMarcados((atual) =>
                        atual.includes(i) ? atual.filter((x) => x !== i) : [...atual, i],
                      )
                    }
                  />
                  {item}
                </label>
              ))}
            </div>

            <label htmlFor="obs-crea" style={{ display: "block", marginTop: "1.2rem" }}>
              Observação (obrigatória ao rejeitar)
            </label>
            <textarea
              id="obs-crea"
              rows={2}
              maxLength={255}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              style={{ width: "100%" }}
            />

            {erro && (
              <p role="alert" style={{ color: "#b42318" }}>
                {erro}
              </p>
            )}

            <div className="modal-revisar-actions">
              <button className="btn-fechar" onClick={() => setModalAberto(null)}>
                Fechar
              </button>
              <button
                className="btn-rejeitar"
                disabled={enviando}
                onClick={() => decidir(false)}
              >
                <MdOutlineCancel /> Rejeitar
              </button>
              <button
                className="btn-aprovar"
                disabled={enviando || !tudoConferido}
                title={tudoConferido ? "" : "Marque os três itens do checklist"}
                onClick={() => decidir(true)}
              >
                <MdOutlineCheckCircle /> Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
