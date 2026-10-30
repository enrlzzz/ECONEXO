import "./area-logada.css";

import { useCallback, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { IconMenu2, IconX } from "@tabler/icons-react";

import Marca from "../shared/marca";
import { useRolagemNoTopoAoTrocarDeRota } from "../../scrollSuave";
import BarraLateral from "./BarraLateral";

const CHAVE_RECOLHIDA = "econexo:menu-recolhido";

function lerRecolhida() {
  try {
    return localStorage.getItem(CHAVE_RECOLHIDA) === "1";
  } catch {
    return false;
  }
}

/**
 * Moldura de todas as telas da área logada: barra lateral à esquerda e o
 * conteúdo ao lado. No celular a barra vira uma gaveta aberta pelo botão
 * da faixa de topo.
 *
 * É um layout de rota (ver main.jsx): as telas renderizam só o próprio
 * conteúdo, dentro de <main className="area-logada">.
 */
export default function AreaLogada() {
  useRolagemNoTopoAoTrocarDeRota();

  const [recolhida, setRecolhida] = useState(lerRecolhida);
  const [gaveta, setGaveta] = useState(false);

  const alternar = useCallback(() => {
    setRecolhida((atual) => {
      try {
        localStorage.setItem(CHAVE_RECOLHIDA, atual ? "0" : "1");
      } catch {
        // Sem armazenamento: só não lembra a escolha.
      }
      return !atual;
    });
  }, []);
  const fecharGaveta = useCallback(() => setGaveta(false), []);

  useEffect(() => {
    document.body.style.backgroundColor = "var(--eco-bg)";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (!gaveta) return undefined;
    const aoTeclar = (e) => e.key === "Escape" && setGaveta(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [gaveta]);

  return (
    <div className={`shell${recolhida ? " is-recolhida" : ""}`}>
      <a className="eco-pular" href="#conteudo">
        Pular para o conteúdo
      </a>

      <header className="shell-topo">
        <button
          type="button"
          className="shell-topo-menu"
          onClick={() => setGaveta((v) => !v)}
          aria-expanded={gaveta}
          aria-label={gaveta ? "Fechar menu" : "Abrir menu"}
        >
          {gaveta ? <IconX size={22} stroke={1.6} aria-hidden="true" /> : <IconMenu2 size={22} stroke={1.6} aria-hidden="true" />}
        </button>
        <Link to="/menu-user" className="site-marca" aria-label="EcoNexo, ir para a comunidade">
          <Marca />
          EcoNexo
        </Link>
      </header>

      <BarraLateral
        recolhida={recolhida}
        aoAlternar={alternar}
        aberta={gaveta}
        aoFechar={fecharGaveta}
      />

      <main id="conteudo" tabIndex={-1} className="area-logada">
        <Outlet />
      </main>
    </div>
  );
}
