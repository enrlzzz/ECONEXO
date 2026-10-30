import "./area-logada.css";

import { Outlet } from "react-router-dom";

import HeaderInterface from "../interface-user/header-interface";
import BarraInferior from "./BarraInferior";

/**
 * Moldura de todas as telas da área logada: cabeçalho no topo, conteúdo no
 * meio e, no celular, a barra de navegação embaixo.
 *
 * É um layout de rota (ver main.jsx): as telas renderizam só o próprio
 * conteúdo, dentro de <main className="area-logada">.
 */
export default function AreaLogada() {
  return (
    <>
      <a className="eco-pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <HeaderInterface />
      <main id="conteudo" tabIndex={-1} className="area-logada">
        <Outlet />
      </main>
      <BarraInferior />
    </>
  );
}
