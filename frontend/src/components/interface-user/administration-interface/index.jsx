import "./index.css";
import "/src/variables.css";

import { useState } from "react";
import HeaderInterface from "../header-interface";

import { MdOutlineShield } from "react-icons/md";
import { MdOutlineAccessTime } from "react-icons/md";
import { MdOutlineCheckCircle } from "react-icons/md";
import { MdOutlineCancel } from "react-icons/md";
import { MdOutlinePerson } from "react-icons/md";
import { MdOutlineDescription } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { BsExclamationCircle } from "react-icons/bs";

/**
 * Fila de validação de certificações — VAZIA de propósito.
 *
 * Esta lista continha três profissionais fictícios com PDFs inexistentes
 * ("crea-maria.pdf", "nr10-pedro.pdf") e botões de Aprovar/Rejeitar que só
 * mudavam o estado local: recarregar a página desfazia tudo. Num painel cujo
 * propósito é atestar habilitação profissional, dado inventado é pior do que
 * tela vazia — dá a impressão de que alguém foi verificado.
 *
 * Não existe no backend nem tabela de certificação, nem upload de documento,
 * nem papel de administrador. Enquanto isso não existir, a fila fica vazia.
 */
const certificacoes = [];

export default function Administration() {
  const [lista, setLista] = useState(certificacoes);
  const [filtro, setFiltro] = useState("Pendentes");
  const [modalAberto, setModalAberto] = useState(null); // guarda o item selecionado

  const pendentes = lista.filter((c) => c.status === "Pendente").length;
  const aprovados = lista.filter((c) => c.status === "Aprovado").length;
  const rejeitados = lista.filter((c) => c.status === "Rejeitado").length;
  const total = lista.length;

  const filtrarLista = () => {
    if (filtro === "Todos") return lista;
    if (filtro === "Pendentes")
      return lista.filter((c) => c.status === "Pendente");
    if (filtro === "Aprovados")
      return lista.filter((c) => c.status === "Aprovado");
    if (filtro === "Rejeitados")
      return lista.filter((c) => c.status === "Rejeitado");
    return lista;
  };

  const aprovar = (id) => {
    setLista(
      lista.map((c) => (c.id === id ? { ...c, status: "Aprovado" } : c)),
    );
    setModalAberto(null);
  };

  const rejeitar = (id) => {
    setLista(
      lista.map((c) => (c.id === id ? { ...c, status: "Rejeitado" } : c)),
    );
    setModalAberto(null);
  };

  const statusColor = (status) => {
    if (status === "Pendente") return "status-pendente";
    if (status === "Aprovado") return "status-aprovado";
    if (status === "Rejeitado") return "status-rejeitado";
  };

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
              <p>Validação de certificações profissionais</p>
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

        {/* aviso pendentes */}
        {pendentes > 0 && (
          <div className="admin-alert">
            <BsExclamationCircle className="alert-icon" />
            <div>
              <h3>Validações Pendentes</h3>
              <p>
                Você tem {pendentes} certificação(ões) aguardando validação.
                Revise os documentos e aprove ou rejeite cada solicitação.
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

        {/* lista de certificações */}
        <div className="admin-list">
          {filtrarLista().length === 0 && (
            <div className="admin-empty">
              <MdOutlineShield />
              <h3>Nenhuma certificação na fila</h3>
              <p>
                O envio e a validação de documentos ainda não estão disponíveis
                nesta versão. Quando o fluxo existir, as solicitações aparecem
                aqui para revisão.
              </p>
            </div>
          )}
          {filtrarLista().map((cert) => (
            <div className="cert-card" key={cert.id}>
              <div className="cert-card-header">
                <div className="cert-user-info">
                  <span className="cert-avatar">{cert.nome.charAt(0)}</span>
                  <div className="info-avatar">
                    <h3>{cert.nome}</h3>
                    <p>{cert.tipo}</p>
                    <p className="cert-location">
                      <IoLocationOutline /> {cert.cidade}, {cert.estado}
                    </p>
                  </div>
                </div>
                <span className={`cert-status ${statusColor(cert.status)}`}>
                  {cert.status}
                </span>
              </div>

              <div className="cert-docs">
                <p className="cert-docs-title">Documentos Enviados:</p>
                {cert.documentos.map((doc, i) => (
                  <div className="cert-doc-row" key={i}>
                    <span>
                      <MdOutlineDescription /> {doc.nome}
                    </span>
                    <button className="btn-visualizar">Visualizar</button>
                  </div>
                ))}
              </div>

              <p className="cert-data">Enviado em {cert.data}</p>

              {cert.status === "Pendente" && (
                <div className="cert-actions">
                  <button
                    className="btn-revisar"
                    onClick={() => setModalAberto(cert)}
                  >
                    Revisar
                  </button>
                  <button
                    className="btn-aprovar"
                    onClick={() => aprovar(cert.id)}
                  >
                    <MdOutlineCheckCircle /> Aprovar
                  </button>
                  <button
                    className="btn-rejeitar"
                    onClick={() => rejeitar(cert.id)}
                  >
                    <MdOutlineCancel /> Rejeitar
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
                <h3>Revisar Documentos</h3>
                <p>Analise os documentos enviados por {modalAberto.nome}</p>
              </div>
              <span className="close" onClick={() => setModalAberto(null)}>
                ✕
              </span>
            </div>

            <div className="modal-user-card">
              <span className="cert-avatar">{modalAberto.nome.charAt(0)}</span>
              <div>
                <h3>{modalAberto.nome}</h3>
                <p>{modalAberto.tipo}</p>
                <p>Enviado em {modalAberto.data}</p>
              </div>
            </div>

            <h4>Documentos para Validação</h4>
            {modalAberto.documentos.map((doc, i) => (
              <div className="modal-doc-row" key={i}>
                <span className="modal-doc-icon">
                  <MdOutlineDescription />
                </span>
                <div>
                  <p>{doc.nome}</p>
                  <p className="doc-filename">{doc.arquivo}</p>
                </div>
                <button className="btn-visualizar-pdf">Visualizar PDF</button>
              </div>
            ))}

            <div className="checklist">
              <h4>Checklist de Validação</h4>
              {[
                "Documentos são legíveis e completos",
                "Números de registro estão visíveis",
                "Certificados estão dentro da validade",
                "Nome no documento corresponde ao cadastro",
              ].map((item, i) => (
                <p key={i}>
                  <MdOutlineCheckCircle className="check-icon" /> {item}
                </p>
              ))}
            </div>

            <div className="modal-revisar-actions">
              <button
                className="btn-fechar"
                onClick={() => setModalAberto(null)}
              >
                Fechar
              </button>
              <button
                className="btn-rejeitar"
                onClick={() => rejeitar(modalAberto.id)}
              >
                <MdOutlineCancel /> Rejeitar
              </button>
              <button
                className="btn-aprovar"
                onClick={() => aprovar(modalAberto.id)}
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
