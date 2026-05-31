import "./index.css";
import "/src/variables.css";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeaderInterface from "../header-interface";
import { useUserData } from "../../../useUserData";
import { postsService } from "../../../services/posts";
import { mensagensService } from "../../../services/mensagens";
import { SEED_DESTAQUES, SEED_SUGERIDOS } from "../../../services/mockSeeds";

import { IoLocation } from "react-icons/io5";
import { BsShieldCheck, BsCheckCircleFill } from "react-icons/bs";
import { FiCamera, FiHeart, FiMessageCircle, FiShare2 } from "react-icons/fi";
import { TbMessageCircle, TbBolt } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";

const FILTROS_TAB = [
  ["todos", "Tudo"],
  ["seguindo", "Seguindo"],
  ["regiao", "Minha região"],
];

const REGIOES = [
  "Todo o Brasil",
  "São Paulo · SP",
  "Campinas · SP",
  "Sorocaba · SP",
  "Belo Horizonte · MG",
  "Curitiba · PR",
];

function Avatar({ name, initials, color, size = 42 }) {
  return (
    <span
      className="eco-avatar"
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

function Seal({ size = 14 }) {
  return (
    <span className="eco-seal" style={{ width: size, height: size }}>
      <BsCheckCircleFill size={size} />
    </span>
  );
}

function FotoProjeto({ rotulo, kWp, hue = 210, height = 280 }) {
  return (
    <div className="eco-foto" style={{ height }}>
      <div
        className="eco-foto-bg"
        style={{
          backgroundImage: `repeating-linear-gradient(115deg, hsl(${hue} 62% 90%) 0 14px, hsl(${
            hue + 18
          } 55% 80%) 14px 28px)`,
        }}
      />
      <span className="eco-foto-rotulo">{rotulo}</span>
      {kWp && <span className="eco-foto-kwp">{kWp}</span>}
    </div>
  );
}

function CardPerfil({ usuario }) {
  const localizacao = [usuario.cidade, usuario.estado].filter(Boolean).join(" · ");
  return (
    <div className="eco-card eco-perfil">
      <div className="eco-perfil-banner" />
      <div className="eco-perfil-corpo">
        <Avatar
          name={usuario.nome}
          initials={usuario.initials}
          color={usuario.color}
          size={64}
        />
        <div className="eco-perfil-nome-row">
          <h3>{usuario.nome || "Seu perfil"}</h3>
          <Seal />
        </div>
        <p className="eco-perfil-role">{usuario.role || "Profissional EcoNexo"}</p>
        <p className="eco-perfil-local">
          <IoLocation /> {localizacao || "Localização não informada"}
        </p>

        <div className="eco-perfil-badges">
          <span className="eco-badge">
            <BsShieldCheck /> NR-10
          </span>
          <span className="eco-badge">
            <BsShieldCheck /> NR-35
          </span>
        </div>

        <hr className="eco-hairline" />

        <div className="eco-perfil-stats">
          <div>
            <strong>0</strong>
            <small>PROJETOS</small>
          </div>
          <div>
            <strong>0</strong>
            <small>SEGUIDORES</small>
          </div>
          <div>
            <strong>0,0</strong>
            <small>AVALIAÇÃO</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function Composer({ usuario, onPublicar }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [comFoto, setComFoto] = useState(true);

  const enviar = () => {
    if (!texto.trim()) return;
    onPublicar({
      texto: texto.trim(),
      tags: ["Solar", "Novo projeto"],
      foto: comFoto
        ? { rotulo: "foto do projeto · aguardando upload", kWp: null, hue: 205 }
        : null,
    });
    setTexto("");
    setAberto(false);
    setComFoto(true);
  };

  const primeiro = (usuario.nome || "você").split(" ")[0];

  return (
    <div className="eco-card eco-composer">
      <div className="eco-composer-top">
        <Avatar
          name={usuario.nome}
          initials={usuario.initials}
          color={usuario.color}
          size={44}
        />
        <div className="eco-composer-input">
          {!aberto ? (
            <button
              type="button"
              className="eco-composer-trigger"
              onClick={() => setAberto(true)}
            >
              Compartilhe um projeto solar, {primeiro}…
            </button>
          ) : (
            <textarea
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Conte sobre o projeto: potência (kWp), local, tipo de sistema, certificações…"
            />
          )}
        </div>
      </div>
      {aberto && comFoto && (
        <div className="eco-composer-preview eco-anim-fade-up">
          <FotoProjeto
            rotulo="arraste a foto do projeto aqui"
            hue={205}
            height={140}
          />
        </div>
      )}
      <div className="eco-composer-actions">
        <button
          type="button"
          className={`eco-chip ${comFoto ? "is-active" : ""}`}
          onClick={() => setComFoto((v) => !v)}
        >
          <FiCamera /> Foto do projeto
        </button>
        <button type="button" className="eco-chip">
          <BsShieldCheck /> Certificação
        </button>
        <button type="button" className="eco-chip">
          <IoLocation /> Local
        </button>
        <div className="eco-composer-publicar">
          {aberto && (
            <button
              type="button"
              className="eco-btn-ghost"
              onClick={() => {
                setAberto(false);
                setTexto("");
              }}
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            className="eco-btn-primary"
            disabled={!texto.trim()}
            onClick={enviar}
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  usuario,
  onLike,
  onSeguir,
  onComentar,
  onMensagem,
  recemCriado,
  curtidoAgora,
}) {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");

  const enviarComentario = () => {
    if (!novoComentario.trim()) return;
    onComentar(post.id, {
      nome: usuario.nome,
      initials: usuario.initials,
      color: usuario.color,
      texto: novoComentario.trim(),
    });
    setNovoComentario("");
  };

  return (
    <article
      className={`eco-card eco-post ${recemCriado ? "eco-anim-pop-in" : ""}`}
    >
      <header className="eco-post-head">
        <Avatar
          name={post.autor.nome}
          initials={post.autor.initials}
          color={post.autor.color}
          size={46}
        />
        <div className="eco-post-autor">
          <div className="eco-post-autor-linha">
            <strong>{post.autor.nome}</strong>
            {post.autor.verificado && <Seal />}
            <span className="dot">·</span>
            <button
              type="button"
              className={`eco-follow ${post.seguindo ? "is-following" : ""}`}
              onClick={() => onSeguir(post.id)}
            >
              {post.seguindo ? "Seguindo" : "+ Seguir"}
            </button>
          </div>
          <p className="eco-post-role">{post.autor.role}</p>
          <p className="eco-post-meta">
            <IoLocation />
            <span className="eco-post-meta-text">
              {post.autor.regiao
                ? `${post.autor.regiao} · há ${post.tempo}`
                : `há ${post.tempo}`}
            </span>
          </p>
        </div>
        <button
          type="button"
          className="eco-post-mensagem"
          onClick={() => onMensagem(post.autor)}
          title="Enviar mensagem"
        >
          <TbMessageCircle /> Mensagem
        </button>
      </header>

      <p className="eco-post-texto">{post.texto}</p>

      <div className="eco-post-tags">
        {post.tags.map((t) => (
          <span key={t} className="eco-tag">
            #{t}
          </span>
        ))}
      </div>

      {post.foto && (
        <FotoProjeto
          rotulo={post.foto.rotulo}
          kWp={post.foto.kWp}
          hue={post.foto.hue}
          height={300}
        />
      )}

      <div className="eco-post-counts">
        <span>
          <span className="eco-heart-pill">
            <FiHeart fill="#e23b5a" stroke="#e23b5a" />
          </span>
          {post.likes.toLocaleString("pt-BR")}
        </span>
        <button
          type="button"
          onClick={() => setMostrarComentarios((v) => !v)}
          className="eco-count-toggle"
        >
          {post.comentarios.length} comentário
          {post.comentarios.length === 1 ? "" : "s"}
        </button>
      </div>

      <hr className="eco-hairline" />

      <div className="eco-post-acoes">
        <button
          type="button"
          className={`eco-acao ${post.curtido ? "is-liked" : ""}`}
          onClick={() => onLike(post.id)}
        >
          <span className={curtidoAgora ? "eco-anim-heart-burst" : ""}>
            <FiHeart
              fill={post.curtido ? "#e23b5a" : "none"}
              stroke={post.curtido ? "#e23b5a" : "currentColor"}
            />
          </span>{" "}
          Curtir
        </button>
        <button
          type="button"
          className="eco-acao"
          onClick={() => setMostrarComentarios((v) => !v)}
        >
          <FiMessageCircle /> Comentar
        </button>
        <button type="button" className="eco-acao">
          <FiShare2 /> Compartilhar
        </button>
      </div>

      {mostrarComentarios && (
        <div className="eco-post-comentarios">
          <div className="eco-comentario-novo">
            <Avatar
              name={usuario.nome}
              initials={usuario.initials}
              color={usuario.color}
              size={34}
            />
            <input
              type="text"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Escreva um comentário…"
              onKeyDown={(e) => e.key === "Enter" && enviarComentario()}
            />
            <button
              type="button"
              className="eco-btn-primary"
              disabled={!novoComentario.trim()}
              onClick={enviarComentario}
            >
              Enviar
            </button>
          </div>

          {post.comentarios.map((c) => (
            <div key={c.id} className="eco-comentario">
              <Avatar name={c.nome} initials={c.initials} color={c.color} size={34} />
              <div>
                <div className="eco-comentario-bolha">
                  <strong>{c.nome}</strong>
                  <p>{c.texto}</p>
                </div>
                <small>{c.tempo}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function CardDestaques() {
  return (
    <div className="eco-card eco-destaques">
      <h3>
        <TbBolt color="var(--eco-amber)" /> Projetos em destaque
      </h3>
      {SEED_DESTAQUES.map((t, i) => (
        <div key={t.id} className={`eco-destaque ${i ? "with-border" : ""}`}>
          <span className="eco-destaque-icon">
            <TbBolt />
          </span>
          <div>
            <strong>{t.titulo}</strong>
            <p>{t.meta}</p>
            <small>{t.calor}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardSugeridos({ lista, onSeguir, onMensagem }) {
  return (
    <div className="eco-card eco-sugeridos">
      <h3>Profissionais pra seguir</h3>
      {lista.map((s) => (
        <div key={s.id} className="eco-sugerido">
          <Avatar name={s.nome} initials={s.initials} color={s.color} size={40} />
          <div className="eco-sugerido-info">
            <div>
              <strong>{s.nome}</strong>
              {s.verificado && <Seal size={12} />}
            </div>
            <p>{s.role}</p>
            <small>{s.regiao}</small>
          </div>
          <div className="eco-sugerido-acoes">
            <button
              type="button"
              className={s.seguindo ? "eco-btn-soft" : "eco-btn-ghost"}
              onClick={() => onSeguir(s.id)}
            >
              {s.seguindo ? "Seguindo" : "Seguir"}
            </button>
            <button
              type="button"
              className="eco-icon-btn"
              title="Enviar mensagem"
              onClick={() => onMensagem(s)}
            >
              <TbMessageCircle />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardFiltros({ regiao, setRegiao, busca, setBusca }) {
  return (
    <div className="eco-card eco-filtros">
      <h3>Filtrar timeline</h3>
      <label>Buscar</label>
      <div className="eco-input-icon">
        <CiSearch />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="palavra-chave…"
        />
      </div>
      <label>Região</label>
      <select value={regiao} onChange={(e) => setRegiao(e.target.value)}>
        {REGIOES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function TimelineInterface() {
  const navigate = useNavigate();
  const usuario = useUserData();

  const [posts, setPosts] = useState(() => postsService.listar());
  const [sugeridos, setSugeridos] = useState(SEED_SUGERIDOS);
  const [tab, setTab] = useState("todos");
  const [regiao, setRegiao] = useState(REGIOES[0]);
  const [busca, setBusca] = useState("");
  const [recemCriadoId, setRecemCriadoId] = useState(null);
  const [curtidoAgoraId, setCurtidoAgoraId] = useState(null);

  const onPublicar = ({ texto, tags, foto }) => {
    const autorUsuario = {
      id: usuario.id || "me",
      nome: usuario.nome || "Você",
      initials: usuario.initials || "?",
      color: usuario.color || "#2A26C7",
      role: usuario.role || "Profissional EcoNexo",
      regiao: [usuario.cidade, usuario.estado].filter(Boolean).join(" · "),
      verificado: true,
    };
    const novo = postsService.criar({ autor: autorUsuario, texto, tags, foto });
    setPosts(postsService.listar());
    setRecemCriadoId(novo.id);
    window.setTimeout(() => setRecemCriadoId(null), 700);
  };

  const onLike = (id) => {
    const atualizados = postsService.alternarCurtida(id);
    setPosts(atualizados);
    const ficouCurtido = atualizados.find((p) => p.id === id)?.curtido;
    if (ficouCurtido) {
      setCurtidoAgoraId(id);
      window.setTimeout(() => setCurtidoAgoraId(null), 420);
    }
  };
  const onSeguir = (id) => setPosts(postsService.alternarSeguir(id));
  const onComentar = (id, comentario) =>
    setPosts(postsService.comentar(id, comentario));

  const onMensagem = (autor) => {
    const conv = mensagensService.encontrarOuCriarConversaCom({
      id: autor.id,
      nome: autor.nome,
      initials: autor.initials,
      color: autor.color,
      role: autor.role,
      regiao: autor.regiao,
      verificado: autor.verificado,
    });
    navigate(`/menu-user/messages?conversa=${conv.id}`);
  };

  const onSeguirSugerido = (id) =>
    setSugeridos((s) =>
      s.map((u) => (u.id === id ? { ...u, seguindo: !u.seguindo } : u)),
    );

  const minhaRegiao = [usuario.cidade, usuario.estado]
    .filter(Boolean)
    .join(" · ");

  const filtrados = useMemo(() => {
    return posts.filter((p) => {
      if (tab === "seguindo" && !p.seguindo) return false;
      // Só aplica filtro por região quando o usuário tem cidade/estado salvos.
      if (tab === "regiao" && minhaRegiao && p.autor.regiao !== minhaRegiao)
        return false;
      if (regiao !== REGIOES[0] && p.autor.regiao !== regiao) return false;
      if (busca) {
        const k = busca.toLowerCase();
        const hit =
          p.texto.toLowerCase().includes(k) ||
          p.tags.some((t) => t.toLowerCase().includes(k)) ||
          p.autor.nome.toLowerCase().includes(k);
        if (!hit) return false;
      }
      return true;
    });
  }, [posts, tab, regiao, busca, minhaRegiao]);

  return (
    <div className="eco-shell">
      <HeaderInterface />

      <div className="eco-timeline-grid eco-anim-fade-up">
        <aside className="eco-col-left">
          <CardPerfil usuario={usuario} />
        </aside>

        <main className="eco-col-feed">
          <Composer usuario={usuario} onPublicar={onPublicar} />

          <div className="eco-tabs">
            {FILTROS_TAB.map(([k, l]) => (
              <button
                key={k}
                type="button"
                className={`eco-chip ${tab === k ? "is-active" : ""}`}
                onClick={() => setTab(k)}
              >
                {l}
              </button>
            ))}
            <span className="eco-tabs-count">
              {filtrados.length} publicaç{filtrados.length === 1 ? "ão" : "ões"}
            </span>
          </div>

          {filtrados.length === 0 ? (
            <div className="eco-card eco-empty eco-anim-fade-up">
              <CiSearch />
              <h3>Nenhum projeto por aqui</h3>
              <p>Ajuste os filtros para ver mais publicações da comunidade.</p>
              <button
                type="button"
                className="eco-btn-primary"
                onClick={() => {
                  setTab("todos");
                  setRegiao(REGIOES[0]);
                  setBusca("");
                }}
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            filtrados.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                usuario={usuario}
                onLike={onLike}
                onSeguir={onSeguir}
                onComentar={onComentar}
                onMensagem={onMensagem}
                recemCriado={p.id === recemCriadoId}
                curtidoAgora={p.id === curtidoAgoraId}
              />
            ))
          )}
        </main>

        <aside className="eco-col-right">
          <CardFiltros
            regiao={regiao}
            setRegiao={setRegiao}
            busca={busca}
            setBusca={setBusca}
          />
          <CardDestaques />
          <CardSugeridos
            lista={sugeridos}
            onSeguir={onSeguirSugerido}
            onMensagem={onMensagem}
          />
        </aside>
      </div>
    </div>
  );
}
