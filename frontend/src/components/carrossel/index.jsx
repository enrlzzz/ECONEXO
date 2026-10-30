import "./index.css";

import { useCallback, useEffect, useRef, useState } from "react";

import { SLIDES } from "./slides";

const DURACAO = 3000;

function prefereMenosMovimento() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Carrossel educativo da home.
 *
 * 3 s por slide, com barra de progresso no indicador. Pausa no botão, ao
 * passar o mouse e ao focar qualquer coisa dentro (WCAG 2.2.2). Com
 * prefers-reduced-motion não avança sozinho nem anima a troca. Setas do
 * teclado navegam quando o foco está no carrossel.
 */
export default function Carrossel() {
  const [atual, setAtual] = useState(0);
  const [pausadoUsuario, setPausadoUsuario] = useState(prefereMenosMovimento);
  const [pausadoInteracao, setPausadoInteracao] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const raiz = useRef(null);
  const decorrido = useRef(0);

  const ir = useCallback((i) => {
    setAtual((i + SLIDES.length) % SLIDES.length);
    decorrido.current = 0;
    setProgresso(0);
  }, []);

  const parado = pausadoUsuario || pausadoInteracao;

  // Relógio do slide. Guardar o tempo decorrido (e não o instante de início)
  // faz a pausa congelar a barra exatamente onde estava.
  useEffect(() => {
    if (parado) return undefined;
    let anterior = performance.now();
    let quadro;
    const tique = (agora) => {
      decorrido.current += agora - anterior;
      anterior = agora;
      if (decorrido.current >= DURACAO) {
        ir(atual + 1);
        return;
      }
      setProgresso(decorrido.current / DURACAO);
      quadro = requestAnimationFrame(tique);
    };
    quadro = requestAnimationFrame(tique);
    return () => cancelAnimationFrame(quadro);
  }, [parado, atual, ir]);

  const aoTeclar = (e) => {
    if (e.key === "ArrowLeft") ir(atual - 1);
    if (e.key === "ArrowRight") ir(atual + 1);
  };

  return (
    <div
      ref={raiz}
      className={`car${prefereMenosMovimento() ? " car--sem-movimento" : ""}`}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Conteúdo educativo sobre energia"
      onMouseEnter={() => setPausadoInteracao(true)}
      onMouseLeave={() => setPausadoInteracao(raiz.current?.contains(document.activeElement) ?? false)}
      onFocus={() => setPausadoInteracao(true)}
      onBlur={(e) => !raiz.current?.contains(e.relatedTarget) && setPausadoInteracao(false)}
      onKeyDown={aoTeclar}
    >
      <div className="car-trilho">
        <div className="car-faixa" style={{ transform: `translateX(-${atual * 100}%)` }}>
          {SLIDES.map((s, i) => (
            <article
              key={s.titulo}
              className={`car-slide${i === atual ? " is-visivel" : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${SLIDES.length}: ${s.titulo}`}
              aria-hidden={i !== atual}
              inert={i !== atual || undefined}
            >
              {s.conteudo}
            </article>
          ))}
        </div>
      </div>

      <div className="car-controles">
        <div className="car-pilula">
          <button type="button" onClick={() => ir(atual - 1)} aria-label="Slide anterior">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
          </button>
          <div className="car-pontos">
            {SLIDES.map((s, i) => (
              <button
                key={s.titulo}
                type="button"
                className="car-ponto"
                aria-current={i === atual ? "true" : undefined}
                aria-label={`Ir para o slide ${i + 1}: ${s.titulo}`}
                onClick={() => ir(i)}
              >
                <span style={{ width: i === atual ? `${progresso * 100}%` : 0 }} />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => ir(atual + 1)} aria-label="Próximo slide">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
          </button>
          <button
            type="button"
            onClick={() => setPausadoUsuario((v) => !v)}
            aria-label={pausadoUsuario ? "Retomar apresentação automática" : "Pausar apresentação automática"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              {pausadoUsuario ? <path d="M5 3l8 5-8 5z" fill="currentColor" /> : <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" />}
            </svg>
          </button>
        </div>
      </div>
      <p className="eco-sr-only" aria-live="polite">
        Slide {atual + 1} de {SLIDES.length}: {SLIDES[atual].titulo}
      </p>
    </div>
  );
}
