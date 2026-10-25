import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

import { reputacaoService } from "../../../services/validacao";
import { avatarDe } from "../../../format";

const LIMITE_COMENTARIO = 2000;

function Estrelas({ valor }) {
  const cheias = Math.round(valor || 0);
  return (
    <span className="rep-estrelas" aria-label={`${cheias} de 5 estrelas`}>
      {"★".repeat(cheias)}
      <span className="rep-estrelas-vazias">{"★".repeat(5 - cheias)}</span>
    </span>
  );
}

/**
 * Reputação de um profissional: as avaliações recebidas e o formulário para
 * deixar a sua.
 *
 * O servidor é quem garante as regras (não avaliar a si mesmo, uma avaliação
 * por pessoa, avaliador = dono do token). Aqui só mostramos a mensagem dele.
 */
export default function ReputacaoProfissional({ profissional, aoFechar, aoAvaliar }) {
  const [avaliacoes, setAvaliacoes] = useState(null); // null = carregando
  const [erro, setErro] = useState("");

  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [enviado, setEnviado] = useState(false);

  const avatar = avatarDe(profissional);

  useEffect(() => {
    let vivo = true;
    reputacaoService
      .listar(profissional.idUsuario)
      .then((lista) => vivo && setAvaliacoes(Array.isArray(lista) ? lista : []))
      .catch((e) => {
        if (!vivo) return;
        setErro(e.message || "Não foi possível carregar as avaliações.");
        setAvaliacoes([]);
      });
    return () => {
      vivo = false;
    };
  }, [profissional.idUsuario]);

  // Esc fecha o painel.
  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && aoFechar();
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aoFechar]);

  const total = avaliacoes ? avaliacoes.length : 0;
  const media = total
    ? avaliacoes.reduce((soma, a) => soma + (a.estrelas || 0), 0) / total
    : null;

  async function enviar(evento) {
    evento.preventDefault();
    if (estrelas < 1) {
      setErroForm("Escolha de 1 a 5 estrelas.");
      return;
    }

    setEnviando(true);
    setErroForm("");

    try {
      const nova = await reputacaoService.avaliar({
        avaliadoId: profissional.idUsuario,
        estrelas,
        comentario: comentario.trim() || undefined,
      });
      setAvaliacoes((atuais) => [nova, ...(atuais || [])]);
      setEnviado(true);
      aoAvaliar?.();
    } catch (e) {
      // 409 = "você já avaliou"; 400 = nota inválida. A mensagem vem pronta.
      setErroForm(e.message || "Não foi possível enviar a avaliação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="rep-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Reputação de ${profissional.nome}`}
      onClick={(e) => e.target === e.currentTarget && aoFechar()}
    >
      <aside className="rep-painel">
        <header className="rep-topo">
          <span className="avatar" style={{ background: avatar.color }}>
            {avatar.initials}
          </span>
          <div>
            <h2>{profissional.nome}</h2>
            {profissional.creaVerificado ? (
              <span className="selo-crea">CREA verificado</span>
            ) : (
              <span className="selo-crea selo-crea--pendente">CREA não verificado</span>
            )}
          </div>
          <button type="button" className="rep-fechar" onClick={aoFechar} aria-label="Fechar">
            <FiX />
          </button>
        </header>

        <section className="rep-resumo">
          {media === null ? (
            <p>Ainda sem avaliações.</p>
          ) : (
            <>
              <strong>{media.toFixed(1).replace(".", ",")}</strong>
              <Estrelas valor={media} />
              <span>
                {total} avaliaç{total === 1 ? "ão" : "ões"}
              </span>
            </>
          )}
        </section>

        <form className="rep-form" onSubmit={enviar}>
          <h3>Avaliar {profissional.nome.split(" ")[0]}</h3>

          {enviado ? (
            <p className="rep-ok" role="status">
              Avaliação enviada. Obrigado por ajudar a comunidade!
            </p>
          ) : (
            <>
              <div className="rep-nota" role="radiogroup" aria-label="Nota">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={estrelas === n}
                    aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
                    className={n <= estrelas ? "ligada" : ""}
                    onClick={() => setEstrelas(n)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                maxLength={LIMITE_COMENTARIO}
                placeholder="Conte como foi trabalhar com essa pessoa (opcional)"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />

              {erroForm && (
                <p className="search-erro" role="alert">
                  {erroForm}
                </p>
              )}

              <button type="submit" className="btn-perfil" disabled={enviando}>
                {enviando ? "Enviando…" : "Enviar avaliação"}
              </button>
            </>
          )}
        </form>

        <section className="rep-lista">
          <h3>Avaliações recebidas</h3>

          {erro && <p className="search-erro">{erro}</p>}
          {avaliacoes === null && <p className="search-status">Carregando…</p>}
          {avaliacoes !== null && total === 0 && !erro && (
            <p className="search-status">Nenhuma avaliação ainda. Seja o primeiro.</p>
          )}

          {(avaliacoes || []).map((a) => (
            <article className="rep-item" key={a.idAvaliacao}>
              <div className="rep-item-topo">
                <strong>{a.avaliador?.nome || "Usuário"}</strong>
                <Estrelas valor={a.estrelas} />
              </div>
              {a.comentario && <p>{a.comentario}</p>}
            </article>
          ))}
        </section>
      </aside>
    </div>
  );
}
