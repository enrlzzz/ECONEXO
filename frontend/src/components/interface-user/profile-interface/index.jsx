import "./index.css";

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IconMapPin, IconMessageCircle, IconStarFilled } from "@tabler/icons-react";

import ReputacaoProfissional from "../search-interface/ReputacaoProfissional";
import { usuariosService } from "../../../services/usuarios";
import { reputacaoService } from "../../../services/validacao";
import { avatarDe, regiaoDe, tipoProfissionalLabel } from "../../../format";
import { getUser } from "../../../userSession";

function Estrelas({ n }) {
  return (
    <span className="perf-estrelas" aria-label={`${n} de 5 estrelas`}>
      {"★".repeat(n)}
      <span>{"★".repeat(5 - n)}</span>
    </span>
  );
}

/**
 * Perfil profissional — o seu (/menu-user/profile) ou o de outra pessoa
 * (/menu-user/profile?id=12, aberto a partir da busca).
 *
 * Antes a tela lia o profissional do "state" da navegação, que a busca não
 * enviava: abria sempre como "Instalador", com números fixos ("2 Projetos,
 * 1 verificado") e selos NR-10/NR-35 que ninguém tinha conferido. Agora tudo
 * vem da API: o cartão público (GET /usuarios/{id}) e as avaliações.
 */
export default function Profile() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const meuId = getUser()?.id;
  const id = params.get("id") || meuId;
  const ehMeu = String(id) === String(meuId);

  const [pessoa, setPessoa] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [avaliando, setAvaliando] = useState(false);

  useEffect(() => {
    let ativo = true;
    Promise.all([usuariosService.buscarPorId(id), reputacaoService.listar(id).catch(() => [])])
      .then(([p, lista]) => {
        if (!ativo) return;
        setPessoa(p);
        setAvaliacoes(Array.isArray(lista) ? lista : []);
      })
      .catch((e) => ativo && setErro(e.status === 404 ? "Perfil não encontrado." : e.message || "Não foi possível abrir o perfil."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return <div className="pg pg--estreita"><p className="eco-mudo">Carregando perfil…</p></div>;
  }

  if (erro || !pessoa) {
    return (
      <div className="pg pg--estreita">
        <div className="pg-vazio">
          <h2>{erro || "Perfil não encontrado."}</h2>
          <Link to="/menu-user/buscar" className="eco-btn eco-btn--ghost">Voltar para a busca</Link>
        </div>
      </div>
    );
  }

  const a = avatarDe(pessoa);
  const cargo = tipoProfissionalLabel(pessoa.tipoProfissional);
  const regiao = regiaoDe(pessoa);
  const media = avaliacoes.length
    ? avaliacoes.reduce((s, x) => s + (x.estrelas || 0), 0) / avaliacoes.length
    : null;

  return (
    <div className="pg pg--estreita">
      <section className="perf-cartao">
        <span className="perf-avatar" style={{ background: a.color }} aria-hidden="true">
          {a.initials}
        </span>

        <div className="perf-info">
          <h1>{pessoa.nome}</h1>
          {cargo && <p className="perf-cargo">{cargo}</p>}
          <ul className="perf-dados">
            <li>
              <IconMapPin size={16} stroke={1.6} aria-hidden="true" />
              {regiao || "Região não informada"}
            </li>
            <li>
              <IconStarFilled size={14} aria-hidden="true" className="perf-estrela" />
              {media === null
                ? "Sem avaliações"
                : `${media.toFixed(1).replace(".", ",")} · ${avaliacoes.length} avaliaç${avaliacoes.length === 1 ? "ão" : "ões"}`}
            </li>
          </ul>
        </div>

        {/* Ações sempre à direita do cartão (embaixo, no celular). */}
        <div className="perf-acoes">
          {ehMeu ? (
            <>
              <Link to="/menu-user/settings" className="eco-btn eco-btn--primary eco-btn--sm">Editar perfil</Link>
              <Link to="/menu-user/portfolio" className="eco-btn eco-btn--ghost eco-btn--sm">Meu portfólio</Link>
            </>
          ) : (
            <>
              <button type="button" className="eco-btn eco-btn--primary eco-btn--sm"
                onClick={() => navigate(`/menu-user/messages?com=${pessoa.idUsuario}`)}>
                <IconMessageCircle size={16} stroke={1.8} aria-hidden="true" />
                Enviar mensagem
              </button>
              <button type="button" className="eco-btn eco-btn--ghost eco-btn--sm" onClick={() => setAvaliando(true)}>
                Avaliar
              </button>
            </>
          )}
        </div>
      </section>

      {ehMeu && !pessoa.cidade && (
        <p className="eco-alerta eco-alerta--info">
          Seu perfil não aparece nas buscas por região enquanto cidade e estado estiverem vazios.{" "}
          <Link to="/menu-user/settings" className="eco-link">Completar agora</Link>
        </p>
      )}

      <section className="perf-secao" aria-labelledby="titulo-avaliacoes">
        <h2 id="titulo-avaliacoes">Avaliações</h2>
        {avaliacoes.length === 0 ? (
          <p className="eco-mudo">
            {ehMeu
              ? "Você ainda não recebeu avaliações. Elas aparecem aqui quando alguém avaliar seu trabalho."
              : "Ninguém avaliou este profissional ainda."}
          </p>
        ) : (
          <ul className="perf-avaliacoes">
            {avaliacoes.map((av) => (
              <li key={av.idAvaliacao}>
                <div className="perf-av-topo">
                  <strong>{av.avaliador?.nome || "Usuário"}</strong>
                  <Estrelas n={av.estrelas || 0} />
                </div>
                {av.comentario && <p>{av.comentario}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {avaliando && (
        <ReputacaoProfissional
          profissional={{ ...pessoa, creaVerificado: false }}
          aoFechar={() => setAvaliando(false)}
          aoAvaliar={() => reputacaoService.listar(id).then(setAvaliacoes).catch(() => {})}
        />
      )}
    </div>
  );
}
