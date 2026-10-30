import "./index.css";

import { getInitials, colorFor } from "../../userSession";
import { MEMBROS } from "./membros";

function Cartao({ membro }) {
  return (
    <li className="equipe-cartao">
      {membro.foto ? (
        <img className="equipe-foto" src={membro.foto} alt="" width="72" height="72" loading="lazy" decoding="async" />
      ) : (
        <span className="equipe-foto equipe-iniciais" style={{ background: colorFor(membro.nome) }} aria-hidden="true">
          {getInitials(membro.nome)}
        </span>
      )}
      <div className="equipe-texto">
        <h3>{membro.nome}</h3>
        <p className="equipe-papel">{membro.papel}</p>
        {membro.descricao && <p className="equipe-curso">{membro.descricao}</p>}
        {membro.link && (
          <a className="eco-link equipe-link" href={membro.link} target="_blank" rel="noopener noreferrer">
            Ver perfil<span className="eco-sr-only"> de {membro.nome}</span>
          </a>
        )}
      </div>
    </li>
  );
}

/**
 * "Nossa equipe" — cards rolando em faixa contínua (efeito marquee).
 *
 * A lista é renderizada duas vezes e a faixa anda exatamente metade da sua
 * largura, então o fim de uma cópia encosta no começo da outra sem salto.
 * A segunda cópia é aria-hidden/inert: leitor de tela e teclado veem cada
 * pessoa uma vez só. Pausa com o mouse em cima ou com foco dentro; com
 * prefers-reduced-motion a faixa fica parada e rola na mão.
 */
export default function Equipe() {
  return (
    <section className="eco-faixa eco-faixa--nevoa equipe" id="equipe" aria-labelledby="equipe-titulo">
      <div className="eco-container">
        <p className="eco-kicker">Equipe Lunitec</p>
        <h2 className="eco-titulo-secao" id="equipe-titulo">Nossa equipe.</h2>
        <p className="eco-corpo eco-mudo equipe-intro">
          Estudantes de Análise e Desenvolvimento de Sistemas da Facens construindo o EcoNexo no Startup: Project One.
        </p>
      </div>

      <div className="equipe-marquee" style={{ "--qtd": MEMBROS.length }}>
        <div className="equipe-faixa">
          <ul className="equipe-lista">
            {MEMBROS.map((m) => <Cartao key={m.nome} membro={m} />)}
          </ul>
          <ul className="equipe-lista" aria-hidden="true" inert>
            {MEMBROS.map((m) => <Cartao key={m.nome} membro={m} />)}
          </ul>
        </div>
      </div>
    </section>
  );
}
