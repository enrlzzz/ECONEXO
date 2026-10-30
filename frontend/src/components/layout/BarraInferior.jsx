import { NavLink } from "react-router-dom";

import { DESTINOS_PRINCIPAIS } from "./destinos";

/**
 * Navegação do celular: os 5 destinos principais numa barra fixa embaixo,
 * ao alcance do polegar. Some no computador (ver area-logada.css).
 */
export default function BarraInferior() {
  return (
    <nav className="barra-inferior" aria-label="Navegação principal">
      {DESTINOS_PRINCIPAIS.map((destino) => {
        const Icone = destino.Icone;
        return (
          <NavLink key={destino.to} to={destino.to} end={destino.fim}>
            <Icone size={22} stroke={1.6} aria-hidden="true" />
            <span>{destino.rotulo}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
