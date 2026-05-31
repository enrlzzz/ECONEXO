import "./index.css";
import "/src/variables.css";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import HeaderInterface from "../header-interface";
import { useUserData } from "../../../useUserData";
import { mensagensService } from "../../../services/mensagens";

import { CiSearch } from "react-icons/ci";
import { FiPlus, FiSend, FiPaperclip, FiSmile, FiInfo } from "react-icons/fi";
import { TbBolt } from "react-icons/tb";
import { IoLocation } from "react-icons/io5";
import { BsShieldCheck, BsCheckAll, BsCheckCircleFill } from "react-icons/bs";

function Avatar({ name, initials, color, size = 44, online }) {
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
      {online && (
        <span
          className="dm-online"
          style={{ width: size > 44 ? 14 : 11, height: size > 44 ? 14 : 11 }}
        />
      )}
    </span>
  );
}

function Seal({ size = 14 }) {
  return (
    <span className="dm-seal" style={{ width: size, height: size }}>
      <BsCheckCircleFill size={size} />
    </span>
  );
}

function ConvList({ convos, ativoId, busca, setBusca, onSelect }) {
  const filtradas = useMemo(() => {
    if (!busca.trim()) return convos;
    const k = busca.toLowerCase();
    return convos.filter((c) => c.nome.toLowerCase().includes(k));
  }, [convos, busca]);

  return (
    <aside className="dm-col-list">
      <div className="dm-list-head">
        <div className="dm-list-title">
          <h2>Mensagens</h2>
          <button
            type="button"
            className="dm-icon-btn dm-icon-btn-soft"
            title="Nova conversa"
          >
            <FiPlus />
          </button>
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
        {filtradas.length === 0 && (
          <p className="dm-list-empty">Nenhuma conversa encontrada.</p>
        )}
        {filtradas.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`dm-conv ${c.id === ativoId ? "is-active" : ""}`}
            onClick={() => onSelect(c.id)}
          >
            <Avatar
              name={c.nome}
              initials={c.initials}
              color={c.color}
              size={50}
              online={c.online}
            />
            <div className="dm-conv-info">
              <div className="dm-conv-top">
                <span className="dm-conv-name">{c.nome}</span>
                {c.verificado && <Seal size={12} />}
                <span
                  className={`dm-conv-time ${c.naoLidas ? "is-unread" : ""}`}
                >
                  {c.tempo}
                </span>
              </div>
              <div className="dm-conv-bottom">
                <span
                  className={`dm-conv-last ${c.naoLidas ? "is-unread" : ""}`}
                >
                  {c.ultima}
                </span>
                {c.naoLidas > 0 && (
                  <span className="dm-conv-badge">{c.naoLidas}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function ChatThread({ convo, onEnviar, usuario, recemId, aguardando }) {
  const scrollerRef = useRef(null);
  const [valor, setValor] = useState("");

  useLayoutEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [convo?.id, convo?.mensagens?.length, aguardando]);

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

  const enviar = () => {
    const t = valor.trim();
    if (!t) return;
    onEnviar(t);
    setValor("");
  };

  return (
    <section className="dm-col-chat" key={convo.id}>
      <header className="dm-chat-head">
        <Avatar
          name={convo.nome}
          initials={convo.initials}
          color={convo.color}
          size={48}
          online={convo.online}
        />
        <div className="dm-chat-head-info">
          <div className="dm-chat-head-name">
            <strong>{convo.nome}</strong>
            {convo.verificado && <Seal />}
          </div>
          <span
            className={`dm-chat-head-status ${
              convo.online ? "is-online" : ""
            }`}
          >
            {convo.online ? "Online agora" : convo.role}
          </span>
        </div>
        <button type="button" className="dm-icon-btn" title="Informações">
          <FiInfo />
        </button>
      </header>

      <div className="dm-chat-thread eco-anim-fade-up" ref={scrollerRef}>
        <div className="dm-day-divider">Hoje</div>
        {convo.mensagens.length === 0 && !aguardando && (
          <div className="dm-thread-empty">
            <p>Sem mensagens ainda. Envie a primeira para {convo.nome}.</p>
          </div>
        )}
        {convo.mensagens.map((m) => {
          const out = m.de === "eu";
          const isRecem = m.id === recemId;
          return (
            <div
              key={m.id}
              className={`dm-row ${out ? "dm-row-out" : "dm-row-in"} ${
                isRecem ? "eco-anim-bubble-in" : ""
              }`}
            >
              <div className="dm-bubble-wrap">
                <div className={`dm-bubble ${out ? "dm-b-out" : "dm-b-in"}`}>
                  {m.texto}
                </div>
                <div
                  className={`dm-meta ${out ? "dm-meta-out" : "dm-meta-in"}`}
                >
                  {m.tempo}
                  {out && (
                    <BsCheckAll
                      style={{
                        color: m.lido ? "#34d77f" : "var(--eco-ink-4)",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {aguardando && (
          <div className="dm-row dm-row-in">
            <div className="dm-bubble dm-b-in eco-typing eco-anim-bubble-in">
              <i></i>
              <i></i>
              <i></i>
            </div>
          </div>
        )}
      </div>

      <div className="dm-composer">
        <button type="button" className="dm-icon-btn" title="Anexar">
          <FiPaperclip />
        </button>
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
            placeholder={`Escreva para ${convo.nome.split(" ")[0]}…`}
          />
          <button
            type="button"
            className="dm-icon-btn"
            title="Emoji"
          >
            <FiSmile />
          </button>
        </div>
        <button
          type="button"
          className="dm-send"
          disabled={!valor.trim()}
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

  return (
    <aside className="dm-col-ctx">
      <div className="dm-ctx-head">
        <Avatar
          name={convo.nome}
          initials={convo.initials}
          color={convo.color}
          size={76}
          online={convo.online}
        />
        <div className="dm-ctx-name">
          <h3>{convo.nome}</h3>
          {convo.verificado && <Seal />}
        </div>
        <p className="dm-ctx-role">{convo.role}</p>
        {convo.regiao && (
          <p className="dm-ctx-region">
            <IoLocation /> {convo.regiao}
          </p>
        )}

        <div className="dm-ctx-badges">
          <span className="dm-badge">
            <BsShieldCheck /> NR-10
          </span>
          <span className="dm-badge">
            <BsShieldCheck /> NR-35
          </span>
        </div>

        <button type="button" className="dm-ctx-btn">
          Ver perfil completo
        </button>
      </div>

      <div className="dm-ctx-section">
        <span className="dm-ctx-section-title">Projeto em discussão</span>
        <div className="dm-ctx-projeto">
          <div className="dm-ctx-projeto-icon">
            <TbBolt />
          </div>
          <div>
            <strong>Conexão direta EcoNexo</strong>
            <p>{convo.role}</p>
          </div>
        </div>
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
  const [aguardando, setAguardando] = useState(false);
  const [recemMsgId, setRecemMsgId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const lista = mensagensService.listar();
    setConvos(lista);

    const paramConv = searchParams.get("conversa");
    if (paramConv && lista.some((c) => c.id === paramConv)) {
      setAtivoId(paramConv);
      const atualizadas = mensagensService.marcarComoLida(paramConv);
      setConvos(atualizadas);
    } else if (lista.length > 0) {
      setAtivoId(lista[0].id);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const selecionar = (id) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAguardando(false);
    setRecemMsgId(null);
    setAtivoId(id);
    setConvos(mensagensService.marcarComoLida(id));
    if (searchParams.get("conversa") !== id) {
      const next = new URLSearchParams(searchParams);
      next.set("conversa", id);
      setSearchParams(next, { replace: true });
    }
  };

  const enviar = (texto) => {
    if (!ativoId) return;
    const atualizadas = mensagensService.enviar(ativoId, texto);
    setConvos(atualizadas);
    const c = atualizadas.find((x) => x.id === ativoId);
    const ultima = c?.mensagens[c.mensagens.length - 1];
    setRecemMsgId(ultima?.id || null);
    setAguardando(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const c2 = mensagensService.receberRespostaSimulada(ativoId);
      setConvos(c2);
      setAguardando(false);
      const conv2 = c2.find((x) => x.id === ativoId);
      const ult = conv2?.mensagens[conv2.mensagens.length - 1];
      setRecemMsgId(ult?.id || null);
      timerRef.current = null;
    }, 1500);
  };

  const ativo = convos.find((c) => c.id === ativoId);

  return (
    <div className="dm-shell">
      <HeaderInterface />
      <div className="dm-grid eco-anim-fade-up">
        <ConvList
          convos={convos}
          ativoId={ativoId}
          busca={busca}
          setBusca={setBusca}
          onSelect={selecionar}
        />
        <ChatThread
          convo={ativo}
          onEnviar={enviar}
          usuario={usuario}
          recemId={recemMsgId}
          aguardando={aguardando}
        />
        <ContextPanel convo={ativo} />
      </div>
    </div>
  );
}
