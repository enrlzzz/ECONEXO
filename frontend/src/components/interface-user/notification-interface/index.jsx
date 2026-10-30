import "./index.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAward,
  FiBell,
  FiHeart,
  FiMessageCircle,
  FiMessageSquare,
  FiStar,
} from "react-icons/fi";

import { notificacoesService } from "../../../services/notificacoes";
import { EVENTO_NOTIFICACOES } from "../../../useNotificacoesNaoLidas";
import { tempoRelativo } from "../../../format";

const ICONES = {
  MENSAGEM: FiMessageCircle,
  CURTIDA: FiHeart,
  COMENTARIO: FiMessageSquare,
  AVALIACAO: FiStar,
  CREA: FiAward,
};

/** Para onde cada tipo de notificação leva ao ser aberta. */
function destinoDe(item) {
  switch (item.tipo) {
    case "MENSAGEM":
      return item.atorId
        ? `/menu-user/messages?com=${item.atorId}`
        : "/menu-user/messages";
    case "CURTIDA":
    case "COMENTARIO":
      return "/menu-user";
    case "AVALIACAO":
      return "/menu-user/reputacao";
    case "CREA":
      return "/menu-user/validacao";
    default:
      return null;
  }
}

/** Avisa o sino do cabeçalho para recontar sem esperar o próximo minuto. */
function avisarSino() {
  window.dispatchEvent(new Event(EVENTO_NOTIFICACOES));
}

export default function NotificationInterface() {
  const navigate = useNavigate();

  const [itens, setItens] = useState(null); // null = carregando
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("todas"); // todas | nao-lidas

  useEffect(() => {
    let vivo = true;
    notificacoesService
      .listar()
      .then((lista) => vivo && setItens(lista))
      .catch((e) => {
        if (!vivo) return;
        setErro(e.message || "Não foi possível carregar as notificações.");
        setItens([]);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const naoLidas = itens ? itens.filter((i) => !i.lida).length : 0;
  const visiveis = (itens || []).filter(
    (i) => filtro === "todas" || !i.lida,
  );

  async function marcarTodas() {
    setErro("");
    try {
      await notificacoesService.marcarLidas();
      setItens((atuais) => atuais.map((i) => ({ ...i, lida: true })));
      avisarSino();
    } catch (e) {
      setErro(e.message || "Não foi possível marcar como lidas.");
    }
  }

  async function abrir(item) {
    // Marca como lida ao abrir. Se falhar, a navegação segue: o aviso de
    // "lida" é conveniência e não pode travar o clique.
    if (!item.lida) {
      try {
        await notificacoesService.marcarLida(item.idNotificacao);
        setItens((atuais) =>
          atuais.map((i) =>
            i.idNotificacao === item.idNotificacao ? { ...i, lida: true } : i,
          ),
        );
        avisarSino();
      } catch {
        // segue para o destino mesmo assim
      }
    }

    const destino = destinoDe(item);
    if (destino) navigate(destino);
  }

  return (
    <div className="notifications-page">

      <main className="notifications-container">
        <div className="notifications-title">
          <div>
            <h1>Notificações</h1>
            <p>Acompanhe interações e novas mensagens da sua rede.</p>
          </div>

          <button
            type="button"
            onClick={marcarTodas}
            disabled={naoLidas === 0}
          >
            Marcar todas como lidas
          </button>
        </div>

        <div className="notifications-filtros" role="group" aria-label="Filtrar">
          <button
            type="button"
            className={filtro === "todas" ? "ativo" : ""}
            onClick={() => setFiltro("todas")}
          >
            Todas
          </button>
          <button
            type="button"
            className={filtro === "nao-lidas" ? "ativo" : ""}
            onClick={() => setFiltro("nao-lidas")}
          >
            Não lidas{naoLidas > 0 ? ` (${naoLidas})` : ""}
          </button>
        </div>

        {erro && (
          <p className="notification-error" role="alert">
            {erro}
          </p>
        )}

        {itens === null && <p className="notifications-carregando">Carregando…</p>}

        {itens !== null && (
          <section className="notifications-list">
            {visiveis.length ? (
              visiveis.map((item) => {
                const Icone = ICONES[item.tipo] || FiBell;
                return (
                  <button
                    type="button"
                    key={item.idNotificacao}
                    className={`notifications-item${item.lida ? " read" : ""}`}
                    onClick={() => abrir(item)}
                  >
                    <span className="notification-icon" aria-hidden="true">
                      <Icone />
                    </span>

                    <span className="notification-corpo">
                      <strong>{item.ator || "EcoNexo"}</strong>
                      <span className="notification-texto">{item.texto}</span>
                      <small>{tempoRelativo(item.criadoEm)}</small>
                    </span>

                    {!item.lida && (
                      <span
                        className="notification-ponto"
                        aria-label="Não lida"
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="notifications-empty">
                <FiBell aria-hidden="true" />
                <h2>
                  {filtro === "nao-lidas" && itens.length
                    ? "Nada por ler"
                    : "Tudo em dia"}
                </h2>
                <p>
                  Quando alguém enviar mensagem, curtir, comentar ou avaliar
                  você, avisaremos aqui.
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
