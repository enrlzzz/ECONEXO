import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Rolagem suave até o topo.
 *
 * O `behavior` é sempre explícito porque o padrão (`"auto"`) delega ao
 * `scroll-behavior` do CSS, que neste projeto é `smooth` — ou seja, o
 * padrão nunca seria instantâneo aqui.
 */
export function rolarAoTopo(suave = true) {
  const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  // "instant", não "auto": por especificação `behavior: "auto"` delega ao
  // `scroll-behavior` do CSS — e o nosso html é `smooth`. O resultado era
  // que o caminho de reduced-motion animava do mesmo jeito, apesar da
  // guarda acima estar correta. "instant" força a rolagem imediata.
  window.scrollTo({ top: 0, behavior: suave && !reduzido ? "smooth" : "instant" });
}

/**
 * Comportamento do logo do header, igual na landing e na área logada.
 *
 * - Já está na rota de destino → não navega, só volta ao topo suavemente.
 *   Sem isto, clicar no logo estando na home recarregava a mesma rota e
 *   não acontecia nada visível: a página continuava rolada onde estava.
 * - Está em outra rota → deixa o <Link> navegar normalmente. O
 *   useRolagemNoTopoAoTrocarDeRota abaixo cuida de chegar no topo.
 */
export function useLogoAoTopo(destino) {
  const { pathname } = useLocation();
  const navegar = useNavigate();

  return (evento) => {
    if (pathname !== destino) return;
    evento.preventDefault();
    rolarAoTopo();
    // Limpa um #hash preso na URL, senão o próximo clique no mesmo
    // link de âncora não dispara nada.
    if (window.location.hash) navegar(destino, { replace: true });
  };
}

/**
 * Leva ao topo a cada troca de rota.
 *
 * Numa SPA o navegador não reposiciona o scroll sozinho: quem estava no
 * rodapé da timeline e abria Projetos caía no meio da página nova. A
 * rolagem aqui é instantânea de propósito — animar a subida enquanto a
 * tela seguinte está montando parece travamento, não transição.
 *
 * Vive nos headers porque eles são o único componente presente em todas
 * as rotas.
 */
export function useRolagemNoTopoAoTrocarDeRota() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Com âncora na URL quem manda é o alvo da âncora, não o topo.
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
}

/**
 * Rolagem suave com inércia na landing (Lenis).
 *
 * O `scroll-behavior: smooth` do CSS só anima clique em âncora; a roda do
 * mouse e o trackpad continuam "secos". O Lenis suaviza os dois e também
 * leva os links `/#aprenda` até a seção (o react-router não rola até o hash
 * sozinho). Só roda onde é chamado — a área logada mantém a rolagem nativa.
 * Quem pediu "reduzir movimento" no sistema fica com a rolagem normal.
 */
export function useRolagemSuaveDaHome() {
  const { hash } = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const lenis = new Lenis({ duration: 1.1, anchors: false });
    lenisRef.current = lenis;

    let quadro = requestAnimationFrame(function passo(t) {
      lenis.raf(t);
      quadro = requestAnimationFrame(passo);
    });

    return () => {
      cancelAnimationFrame(quadro);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Chegou com #aprenda / #profissionais: rola até a seção, descontando a
  // barra fixa (o scroll-margin-top do CSS vale só para a rolagem nativa).
  useEffect(() => {
    if (!hash) return;
    const alvo = document.getElementById(hash.slice(1));
    if (!alvo) return;
    const alturaBarra = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--eco-nav-h")) || 52;
    const folga = -alturaBarra - 16;
    if (lenisRef.current) lenisRef.current.scrollTo(alvo, { offset: folga });
    else alvo.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);
}
