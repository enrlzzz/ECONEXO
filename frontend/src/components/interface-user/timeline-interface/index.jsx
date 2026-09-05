import "./index.css";
import "/src/variables.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeaderInterface from "../header-interface";
import { useUserData } from "../../../useUserData";
import { postsService } from "../../../services/posts";
import { profissionaisService } from "../../../services/profissionais";
import {
  avatarDe,
  regiaoDe,
  tempoRelativo,
  tipoProfissionalLabel,
} from "../../../format";

import { IoLocation } from "react-icons/io5";
import { BsShieldCheck } from "react-icons/bs";
import { FiHeart, FiMessageCircle, FiTrash2 } from "react-icons/fi";
import { TbMessageCircle } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";

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
        </div>
        <p className="eco-perfil-role">
          {tipoProfissionalLabel(usuario.role) ||
            "Perfil profissional não informado"}
        </p>
        <p className="eco-perfil-local">
          <IoLocation /> {localizacao || "Localização não informada"}
        </p>

        <hr className="eco-hairline" />

        <p className="eco-perfil-dica">
          Complete seu perfil em <strong>Configurações</strong> para aparecer nas
          buscas por região e especialidade.
        </p>
      </div>
    </div>
  );
}

function Composer({ usuario, onPublicar, enviando }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");

  const enviar = async () => {
    if (!texto.trim()) return;
    const ok = await onPublicar(texto.trim());
    if (ok) {
      setTexto("");
      setAberto(false);
    }
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
      <div className="eco-composer-actions">
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
            disabled={!texto.trim() || enviando}
            onClick={enviar}
          >
            {enviando ? "Publicando…" : "Publicar"}
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
  onComentar,
  onMensagem,
  onExcluir,
  recemCriado,
  curtidoAgora,
}) {
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [novoComentario, setNovoComentario] = useState("");

  const autor = avatarDe(post.autor);
  const regiao = regiaoDe(post.autor);
  const cargo = tipoProfissionalLabel(post.autor.tipoProfissional);
  const souAutor = String(post.autor.idUsuario) === String(usuario.id);

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    await onComentar(post.idPost, novoComentario.trim());
    setNovoComentario("");
  };

  return (
    <article
      className={`eco-card eco-post ${recemCriado ? "eco-anim-pop-in" : ""}`}
    >
      <header className="eco-post-head">
        <Avatar
          name={autor.nome}
          initials={autor.initials}
          color={autor.color}
          size={46}
        />
        <div className="eco-post-autor">
          <div className="eco-post-autor-linha">
            <strong>{autor.nome}</strong>
          </div>
          {cargo && <p className="eco-post-role">{cargo}</p>}
          <p className="eco-post-meta">
            <IoLocation />
            <span className="eco-post-meta-text">
              {regiao
                ? `${regiao} · ${tempoRelativo(post.criadoEm)}`
                : tempoRelativo(post.criadoEm)}
            </span>
          </p>
        </div>

        {souAutor ? (
          <button
            type="button"
            className="eco-post-excluir"
            onClick={() => onExcluir(post.idPost)}
            title="Excluir publicação"
          >
            <FiTrash2 />
          </button>
        ) : (
          <button
            type="button"
            className="eco-post-mensagem"
            onClick={() => onMensagem(post.autor)}
            title="Enviar mensagem"
          >
            <TbMessageCircle /> Mensagem
          </button>
        )}
      </header>

      <p className="eco-post-texto">{post.texto}</p>

      <div className="eco-post-counts">
        <span>
          <span className="eco-heart-pill">
            <FiHeart fill="#e23b5a" stroke="#e23b5a" />
          </span>
          {post.curtidas.toLocaleString("pt-BR")}
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
          className={`eco-acao ${post.curtidoPorMim ? "is-liked" : ""}`}
          onClick={() => onLike(post.idPost)}
        >
          <span className={curtidoAgora ? "eco-anim-heart-burst" : ""}>
            <FiHeart
              fill={post.curtidoPorMim ? "#e23b5a" : "none"}
              stroke={post.curtidoPorMim ? "#e23b5a" : "currentColor"}
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

          {post.comentarios.map((c) => {
            const a = avatarDe(c.autor);
            return (
              <div key={c.idComentario} className="eco-comentario">
                <Avatar
                  name={a.nome}
                  initials={a.initials}
                  color={a.color}
                  size={34}
                />
                <div>
                  <div className="eco-comentario-bolha">
                    <strong>{a.nome}</strong>
                    <p>{c.texto}</p>
                  </div>
                  <small>{tempoRelativo(c.criadoEm)}</small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

/**
 * Profissionais reais cadastrados, exceto o próprio usuário.
 *
 * Sem botão "Seguir": não existe tabela de seguidores no backend, e um botão
 * que muda de cor sem persistir nada é pior do que botão nenhum.
 */
function CardProfissionais({ lista, onMensagem }) {
  if (lista.length === 0) return null;

  return (
    <div className="eco-card eco-sugeridos">
      <h3>Profissionais na plataforma</h3>
      {lista.map((p) => {
        const a = avatarDe(p);
        const cargo = tipoProfissionalLabel(p.tipoProfissional);
        const regiao = regiaoDe(p);
        return (
          <div key={p.idUsuario} className="eco-sugerido">
            <Avatar name={a.nome} initials={a.initials} color={a.color} size={40} />
            <div className="eco-sugerido-info">
              <div>
                <strong>{a.nome}</strong>
              </div>
              {cargo && <p>{cargo}</p>}
              {regiao && <small>{regiao}</small>}
            </div>
            <div className="eco-sugerido-acoes">
              <button
                type="button"
                className="eco-icon-btn"
                title="Enviar mensagem"
                onClick={() => onMensagem(p)}
              >
                <TbMessageCircle />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CardFiltros({ busca, setBusca }) {
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
      <p className="eco-filtros-nota">
        <BsShieldCheck /> Busca por texto da publicação ou nome do autor.
      </p>
    </div>
  );
}

export default function TimelineInterface() {
  const navigate = useNavigate();
  const usuario = useUserData();

  const [posts, setPosts] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [recemCriadoId, setRecemCriadoId] = useState(null);
  const [curtidoAgoraId, setCurtidoAgoraId] = useState(null);

  // Nenhum setState síncrono no corpo do effect: `carregando` já nasce true,
  // e todo o resto acontece nas continuações da promise. Isso evita o ciclo
  // extra de render que o react-hooks/set-state-in-effect aponta, e o flag
  // `ativo` evita gravar estado depois que o componente saiu da tela.
  useEffect(() => {
    let ativo = true;
    postsService
      .listar()
      .then((lista) => {
        if (ativo) setPosts(Array.isArray(lista) ? lista : []);
      })
      .catch((e) => {
        if (ativo) setErro(e.message || "Não foi possível carregar a timeline.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    profissionaisService
      .buscar()
      .then((lista) => {
        if (!ativo) return;
        const outros = (Array.isArray(lista) ? lista : []).filter(
          (p) => String(p.idUsuario) !== String(usuario.id),
        );
        setProfissionais(outros.slice(0, 5));
      })
      // Falha aqui não pode derrubar a timeline: é só um cartão lateral.
      .catch(() => setProfissionais([]));
    return () => {
      ativo = false;
    };
  }, [usuario.id]);

  const onPublicar = async (texto) => {
    setEnviando(true);
    setErro("");
    try {
      const novo = await postsService.criar(texto);
      setPosts((atuais) => [novo, ...atuais]);
      setRecemCriadoId(novo.idPost);
      window.setTimeout(() => setRecemCriadoId(null), 700);
      return true;
    } catch (e) {
      setErro(e.message || "Não foi possível publicar.");
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const onLike = async (idPost) => {
    try {
      const atualizado = await postsService.alternarCurtida(idPost);
      setPosts((atuais) =>
        atuais.map((p) => (p.idPost === idPost ? atualizado : p)),
      );
      if (atualizado.curtidoPorMim) {
        setCurtidoAgoraId(idPost);
        window.setTimeout(() => setCurtidoAgoraId(null), 420);
      }
    } catch (e) {
      setErro(e.message || "Não foi possível curtir.");
    }
  };

  const onComentar = async (idPost, texto) => {
    try {
      const comentario = await postsService.comentar(idPost, texto);
      setPosts((atuais) =>
        atuais.map((p) =>
          p.idPost === idPost
            ? { ...p, comentarios: [...p.comentarios, comentario] }
            : p,
        ),
      );
    } catch (e) {
      setErro(e.message || "Não foi possível comentar.");
    }
  };

  const onExcluir = async (idPost) => {
    try {
      await postsService.excluir(idPost);
      setPosts((atuais) => atuais.filter((p) => p.idPost !== idPost));
    } catch (e) {
      setErro(e.message || "Não foi possível excluir.");
    }
  };

  // A conversa é identificada pelo id do outro usuário. Não existe mais
  // "criar conversa" no cliente: ela nasce da primeira mensagem enviada.
  const onMensagem = (profissional) =>
    navigate(`/menu-user/messages?com=${profissional.idUsuario}`);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return posts;
    const k = busca.toLowerCase();
    return posts.filter(
      (p) =>
        p.texto.toLowerCase().includes(k) ||
        (p.autor?.nome || "").toLowerCase().includes(k),
    );
  }, [posts, busca]);

  return (
    <div className="eco-shell">
      <HeaderInterface />

      <div className="eco-timeline-grid eco-anim-fade-up">
        <aside className="eco-col-left">
          <CardPerfil usuario={usuario} />
        </aside>

        <main className="eco-col-feed">
          <Composer
            usuario={usuario}
            onPublicar={onPublicar}
            enviando={enviando}
          />

          {erro && <div className="eco-card eco-erro">{erro}</div>}

          <div className="eco-tabs">
            <span className="eco-tabs-count">
              {carregando
                ? "carregando…"
                : `${filtrados.length} publicaç${
                    filtrados.length === 1 ? "ão" : "ões"
                  }`}
            </span>
          </div>

          {carregando ? (
            <div className="eco-card eco-empty">
              <p>Carregando a timeline…</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="eco-card eco-empty eco-anim-fade-up">
              <CiSearch />
              {busca.trim() ? (
                <>
                  <h3>Nada encontrado</h3>
                  <p>Nenhuma publicação corresponde a essa busca.</p>
                  <button
                    type="button"
                    className="eco-btn-primary"
                    onClick={() => setBusca("")}
                  >
                    Limpar busca
                  </button>
                </>
              ) : (
                <>
                  <h3>A timeline ainda está vazia</h3>
                  <p>
                    Nenhum projeto foi publicado até agora. Seja a primeira
                    pessoa a compartilhar uma obra com a comunidade — é só
                    escrever no campo acima.
                  </p>
                </>
              )}
            </div>
          ) : (
            filtrados.map((p) => (
              <PostCard
                key={p.idPost}
                post={p}
                usuario={usuario}
                onLike={onLike}
                onComentar={onComentar}
                onMensagem={onMensagem}
                onExcluir={onExcluir}
                recemCriado={p.idPost === recemCriadoId}
                curtidoAgora={p.idPost === curtidoAgoraId}
              />
            ))
          )}
        </main>

        <aside className="eco-col-right">
          <CardFiltros busca={busca} setBusca={setBusca} />
          <CardProfissionais lista={profissionais} onMensagem={onMensagem} />
        </aside>
      </div>
    </div>
  );
}
