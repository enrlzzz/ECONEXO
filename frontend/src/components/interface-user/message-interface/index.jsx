import "./index.css";
import "/src/variables.css";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import HeaderInterface from "../header-interface";
import { useUserData } from "../../../useUserData";
import { mensagensService } from "../../../services/mensagens";
import { profissionaisService } from "../../../services/profissionais";
import {
  avatarDe,
  regiaoDe,
  horaDe,
  tempoRelativo,
  tipoProfissionalLabel,
} from "../../../format";

import { CiSearch } from "react-icons/ci";
import { FiSend, FiInfo } from "react-icons/fi";
import { IoLocation } from "react-icons/io5";
import { BsCheckAll } from "react-icons/bs";

function Avatar({ name, initials, color, size = 44 }) {
  return (
    <span
      className="dm-avatar"
      title={name}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </span>
  );
}

function ConvList({ convos, ativoId, busca, setBusca, onSelect }) {
  const filtradas = useMemo(() => {
    if (!busca.trim()) return convos;
    const k = busca.toLowerCase();
    return convos.filter((c) =>
      (c.participante?.nome || "").toLowerCase().includes(k),
    );
  }, [convos, busca]);

  return (
    <aside className="dm-col-list">
      <div className="dm-list-head">
        <div className="dm-list-title">
          <h2>Mensagens</h2>
        </div>
        <div className="dm-search">
          <CiSearch />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar conversa…"
          />
        </div>
      </div>

      <div className="dm-list-body">
        {convos.length === 0 && (
          <p className="dm-list-empty">
            Você ainda não tem conversas. Abra o perfil de alguém na busca ou na
            timeline e envie a primeira mensagem.
          </p>
        )}
        {convos.length > 0 && filtradas.length === 0 && (
          <p className="dm-list-empty">Nenhuma conversa encontrada.</p>
        )}
        {filtradas.map((c) => {
          const a = avatarDe(c.participante);
          return (
            <button
              key={c.participante.idUsuario}
              type="button"
              className={`dm-conv ${
                c.participante.idUsuario === ativoId ? "is-active" : ""
              }`}
              onClick={() => onSelect(c.participante.idUsuario)}
            >
              <Avatar
                name={a.nome}
                initials={a.initials}
                color={a.color}
                size={50}
              />
              <div className="dm-conv-info">
                <div className="dm-conv-top">
                  <span className="dm-conv-name">{a.nome}</span>
                  <span
                    className={`dm-conv-time ${c.naoLidas ? "is-unread" : ""}`}
                  >
                    {tempoRelativo(c.ultimaEm)}
                  </span>
                </div>
                <div className="dm-conv-bottom">
                  <span
                    className={`dm-conv-last ${c.naoLidas ? "is-unread" : ""}`}
                  >
                    {c.ultimaMensagem}
                  </span>
                  {c.naoLidas > 0 && (
                    <span className="dm-conv-badge">{c.naoLidas}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function ChatThread({ convo, onEnviar, usuario, recemId, enviando }) {
  const scrollerRef = useRef(null);
  const [valor, setValor] = useState("");

  useLayoutEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [convo?.participante?.idUsuario, convo?.mensagens?.length]);

  if (!convo) {
    return (
      <section className="dm-col-chat dm-empty-chat">
        <div>
          <h3>Selecione uma conversa</h3>
          <p>Suas conversas com a comunidade EcoNexo aparecem aqui.</p>
        </div>
      </section>
    );
  }

  const a = avatarDe(convo.participante);
  const cargo = tipoProfissionalLabel(convo.participante.tipoProfissional);

  const enviar = async () => {
    const t = valor.trim();
    if (!t) return;
    const ok = await onEnviar(t);
    if (ok) setValor("");
  };

  return (
    <section className="dm-col-chat" key={convo.participante.idUsuario}>
      <header className="dm-chat-head">
        <Avatar name={a.nome} initials={a.initials} color={a.color} size={48} />
        <div className="dm-chat-head-info">
          <div className="dm-chat-head-name">
            <strong>{a.nome}</strong>
          </div>
          <span className="dm-chat-head-status">{cargo}</span>
        </div>
        <button type="button" className="dm-icon-btn" title="Informações">
          <FiInfo />
        </button>
      </header>

      <div className="dm-chat-thread eco-anim-fade-up" ref={scrollerRef}>
        {convo.mensagens.length === 0 && (
          <div className="dm-thread-empty">
            <p>Sem mensagens ainda. Envie a primeira para {a.nome}.</p>
          </div>
        )}
        {convo.mensagens.map((m) => {
          const out = String(m.remetenteId) === String(usuario.id);
          const isRecem = m.idMensagem === recemId;
          return (
            <div
              key={m.idMensagem}
              className={`dm-row ${out ? "dm-row-out" : "dm-row-in"} ${
                isRecem ? "eco-anim-bubble-in" : ""
              }`}
            >
              <div className="dm-bubble-wrap">
                <div className={`dm-bubble ${out ? "dm-b-out" : "dm-b-in"}`}>
                  {m.texto}
                </div>
                <div className={`dm-meta ${out ? "dm-meta-out" : "dm-meta-in"}`}>
                  {horaDe(m.criadoEm)}
                  {out && (
                    <BsCheckAll
                      style={{ color: m.lida ? "#34d77f" : "var(--eco-ink-4)" }}
                      title={m.lida ? "Lida" : "Enviada"}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dm-composer">
        <div className="dm-composer-input">
          <textarea
            rows={1}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
            placeholder={`Escreva para ${a.nome.split(" ")[0]}…`}
          />
        </div>
        <button
          type="button"
          className="dm-send"
          disabled={!valor.trim() || enviando}
          onClick={enviar}
          title="Enviar"
        >
          <FiSend />
        </button>
      </div>
    </section>
  );
}

function ContextPanel({ convo }) {
  if (!convo) {
    return (
      <aside className="dm-col-ctx">
        <p className="dm-ctx-empty">Detalhes do contato aparecem aqui.</p>
      </aside>
    );
  }

  const a = avatarDe(convo.participante);
  const cargo = tipoProfissionalLabel(convo.participante.tipoProfissional);
  const regiao = regiaoDe(convo.participante);

  return (
    <aside className="dm-col-ctx">
      <div className="dm-ctx-head">
        <Avatar name={a.nome} initials={a.initials} color={a.color} size={76} />
        <div className="dm-ctx-name">
          <h3>{a.nome}</h3>
        </div>
        {cargo && <p className="dm-ctx-role">{cargo}</p>}
        {regiao && (
          <p className="dm-ctx-region">
            <IoLocation /> {regiao}
          </p>
        )}
      </div>

      <div className="dm-ctx-section">
        <span className="dm-ctx-section-title">Estatísticas</span>
        <p className="dm-ctx-stats">
          <span>{convo.mensagens.length}</span> mensagens trocadas
        </p>
      </div>
    </aside>
  );
}

export default function MessageInterface() {
  const usuario = useUserData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [convos, setConvos] = useState([]);
  const [ativoId, setAtivoId] = useState(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [recemMsgId, setRecemMsgId] = useState(null);

  const paramCom = searchParams.get("com");

  /**
   * Quem veio da timeline/busca com ?com=<id> pode não ter conversa ainda.
   * Nesse caso montamos um rascunho vazio na tela — mas nada é gravado no
   * banco até a primeira mensagem realmente ser enviada.
   */
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const lista = await mensagensService.listar();
      const conversas = Array.isArray(lista) ? lista : [];

      let alvo = paramCom ? Number(paramCom) : null;

      if (alvo && !conversas.some((c) => c.participante.idUsuario === alvo)) {
        try {
          const encontrados = await profissionaisService.buscar();
          const p = (encontrados || []).find((x) => x.idUsuario === alvo);
          if (p) {
            conversas.unshift({
              participante: p,
              ultimaMensagem: "",
              ultimaEm: new Date().toISOString(),
              naoLidas: 0,
              mensagens: [],
            });
          } else {
            alvo = null;
          }
        } catch {
          alvo = null;
        }
      }

      setConvos(conversas);
      setAtivoId(alvo || conversas[0]?.participante.idUsuario || null);
    } catch (e) {
      setErro(e.message || "Não foi possível carregar as mensagens.");
    } finally {
      setCarregando(false);
    }
  }, [paramCom]);

  useEffect(() => {
    // carregar() é async e o primeiro setState só acontece depois do await,
    // mas a chamada em si dispara setCarregando(true) de forma síncrona.
    // Adiar para a microtask seguinte mantém o efeito fora do render atual.
    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) carregar();
    });
    return () => {
      ativo = false;
    };
  }, [carregar]);

  // Abrir uma conversa marca como lida o que chegou para mim.
  useEffect(() => {
    if (!ativoId) return;
    const convo = convos.find((c) => c.participante.idUsuario === ativoId);
    if (!convo || convo.naoLidas === 0) return;

    mensagensService
      .marcarComoLida(ativoId)
      .then(() =>
        setConvos((atuais) =>
          atuais.map((c) =>
            c.participante.idUsuario === ativoId ? { ...c, naoLidas: 0 } : c,
          ),
        ),
      )
      .catch(() => {
        /* não conseguir marcar como lida não quebra a leitura */
      });
  }, [ativoId, convos]);

  const selecionar = (id) => {
    setAtivoId(id);
    setRecemMsgId(null);
    if (searchParams.get("com") !== String(id)) {
      const next = new URLSearchParams(searchParams);
      next.set("com", String(id));
      setSearchParams(next, { replace: true });
    }
  };

  const enviar = async (texto) => {
    if (!ativoId) return false;
    setEnviando(true);
    setErro("");
    try {
      const msg = await mensagensService.enviar(ativoId, texto);
      setConvos((atuais) =>
        atuais.map((c) =>
          c.participante.idUsuario === ativoId
            ? {
                ...c,
                mensagens: [...c.mensagens, msg],
                ultimaMensagem: msg.texto,
                ultimaEm: msg.criadoEm,
              }
            : c,
        ),
      );
      setRecemMsgId(msg.idMensagem);
      return true;
    } catch (e) {
      setErro(e.message || "Não foi possível enviar a mensagem.");
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const ativo = convos.find((c) => c.participante.idUsuario === ativoId);

  return (
    <div className="dm-shell">
      <HeaderInterface />
      {erro && <div className="dm-erro">{erro}</div>}
      <div className="dm-grid eco-anim-fade-up">
        <ConvList
          convos={convos}
          ativoId={ativoId}
          busca={busca}
          setBusca={setBusca}
          onSelect={selecionar}
        />
        {carregando ? (
          <section className="dm-col-chat dm-empty-chat">
            <div>
              <p>Carregando conversas…</p>
            </div>
          </section>
        ) : (
          <ChatThread
            convo={ativo}
            onEnviar={enviar}
            usuario={usuario}
            recemId={recemMsgId}
            enviando={enviando}
          />
        )}
        <ContextPanel convo={ativo} />
      </div>
    </div>
  );
}
