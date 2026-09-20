import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { FiMapPin, FiMessageSquare, FiSearch, FiInfo } from "react-icons/fi";
import { FiCheckCircle, FiTrendingUp } from "react-icons/fi";

import { useUserData } from "../../../useUserData";
import { colorFor, getInitials } from "../../../userSession";
import { profissionaisService } from "../../../services/profissionais";

/**
 * Peças que as duas páginas do protótipo compartilham.
 *
 * No HTML original elas estavam duplicadas literalmente: o card de perfil,
 * a lista de profissionais e o composer apareciam escritos duas vezes, uma
 * em #page-validation e outra em #page-reputation.
 */

/* ===================================================================
   ABAS DE MÓDULO
   No protótipo as duas páginas viviam no mesmo arquivo e as abas só
   trocavam a classe .active. Aqui cada módulo tem a própria rota, então
   as abas são navegação de verdade — o link é compartilhável e o botão
   "voltar" do navegador funciona.
   =================================================================== */
export function AbasModulo() {
  const { pathname } = useLocation();

  const abas = [
    { para: "/menu-user/validacao", rotulo: "Validação", icone: <FiCheckCircle /> },
    { para: "/menu-user/reputacao", rotulo: "Reputação", icone: <FiTrendingUp /> },
  ];

  return (
    <div className="vr-abas-wrap">
      <nav className="vr-abas" aria-label="Módulos de confiança">
        {abas.map((aba) => {
          const ativa = pathname === aba.para;
          return (
            <Link
              key={aba.para}
              to={aba.para}
              className={`vr-aba${ativa ? " ativa" : ""}`}
              aria-current={ativa ? "page" : undefined}
            >
              <span aria-hidden="true">{aba.icone}</span>
              {aba.rotulo}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/* ===================================================================
   CARD DE PERFIL (coluna esquerda)
   =================================================================== */
export function PerfilLateral({ sub, nota }) {
  const usuario = useUserData();
  const iniciais = usuario.initials || getInitials(usuario.nome);
  const cor = usuario.color || colorFor(usuario.nome);

  const localizacao = [usuario.cidade, usuario.estado].filter(Boolean).join(" / ");

  return (
    <aside className="vr-card vr-perfil">
      <div className="vr-perfil-banner" />
      <div className="vr-perfil-corpo">
        <span className="vr-avatar" style={{ background: cor }} aria-hidden="true">
          {iniciais}
        </span>
        <h3>{usuario.nome || "Seu perfil"}</h3>
        <div className="vr-perfil-sub">{sub}</div>
        {localizacao && (
          <div className="vr-perfil-local">
            <FiMapPin aria-hidden="true" />
            {localizacao}
          </div>
        )}
        <div className="vr-divisor" />
        <p className="vr-perfil-nota">{nota}</p>
      </div>
    </aside>
  );
}

/* ===================================================================
   COMPOSER
   =================================================================== */
export function Composer({ convite, acao, aoAgir, meta }) {
  const usuario = useUserData();
  const iniciais = usuario.initials || getInitials(usuario.nome);
  const cor = usuario.color || colorFor(usuario.nome);

  return (
    <section className="vr-card vr-composer">
      <div className="vr-composer-topo">
        <span className="vr-mini-avatar" style={{ background: cor }} aria-hidden="true">
          {iniciais}
        </span>
        <div className="vr-composer-box">
          <button type="button" className="vr-composer-shell" onClick={aoAgir}>
            {convite}
          </button>
          <div className="vr-composer-area" />
          <div className="vr-composer-acoes">
            <button type="button" className="eco-btn eco-btn--primary" onClick={aoAgir}>
              {acao}
            </button>
          </div>
        </div>
      </div>
      {meta && <div className="vr-meta-fina">{meta}</div>}
    </section>
  );
}

/* ===================================================================
   BUSCA LATERAL
   =================================================================== */
export function BuscaLateral({ titulo, valor, aoMudar, ajuda }) {
  return (
    <section className="vr-card vr-card-lateral">
      <h3>{titulo}</h3>
      <div className="vr-rotulo-filtro">BUSCAR</div>
      <div className="vr-busca">
        <FiSearch aria-hidden="true" />
        <input
          type="search"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder="palavra-chave..."
          aria-label={titulo}
        />
      </div>
      <p className="vr-ajuda">
        <FiInfo aria-hidden="true" />
        <span>{ajuda}</span>
      </p>
    </section>
  );
}

/* ===================================================================
   PROFISSIONAIS NA PLATAFORMA
   O protótipo trazia cinco nomes cravados no HTML. Aqui vem da API —
   e, se ninguém estiver cadastrado, o card mostra estado vazio em vez
   de uma lista falsa.
   =================================================================== */
export function ProfissionaisCard() {
  const [profissionais, setProfissionais] = useState(null);

  useEffect(() => {
    let vivo = true;
    profissionaisService
      .buscar()
      .then((lista) => vivo && setProfissionais(lista.slice(0, 5)))
      .catch(() => vivo && setProfissionais([]));
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <section className="vr-card vr-card-lateral">
      <h3>Profissionais na plataforma</h3>

      {profissionais === null && (
        <div className="vr-profissionais" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="eco-skeleton" style={{ height: "34px" }} />
          ))}
        </div>
      )}

      {profissionais?.length === 0 && (
        <p className="vr-ajuda">
          <FiInfo aria-hidden="true" />
          <span>Ninguém cadastrado ainda além de você.</span>
        </p>
      )}

      {profissionais?.length > 0 && (
        <ul className="vr-profissionais">
          {profissionais.map((p) => (
            <li key={p.idUsuario} className="vr-profissional">
              <span
                className="vr-profissional-avatar"
                style={{ background: colorFor(p.nome) }}
                aria-hidden="true"
              >
                {getInitials(p.nome)}
              </span>
              <strong title={p.nome}>{p.nome}</strong>
              <Link
                to="/menu-user/messages"
                className="vr-chat-btn"
                aria-label={`Conversar com ${p.nome}`}
              >
                <FiMessageSquare aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ===================================================================
   TOASTS — o hook vive em useToasts.js (Fast Refresh).
   =================================================================== */
export function Toasts({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="vr-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="vr-toast">
          <i aria-hidden="true">{t.icone}</i>
          <span>{t.mensagem}</span>
        </div>
      ))}
    </div>
  );
}
