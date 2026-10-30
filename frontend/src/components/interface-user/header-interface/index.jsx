import "./index.css";

import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { IconBell } from "@tabler/icons-react";

import { useNotificacoesNaoLidas } from "../../../useNotificacoesNaoLidas";
import PerfilMenu from "../../shared/perfil-menu";
import Marca from "../../shared/marca";
import { useLogoAoTopo, useRolagemNoTopoAoTrocarDeRota } from "../../../scrollSuave";
import { DESTINOS_PRINCIPAIS } from "../../layout/destinos";

/**
 * Barra superior da área logada.
 *
 * Antes eram 10 links lado a lado (Início ... Minhas análises), todos com o
 * mesmo peso, e no celular viravam uma lista comprida atrás do botão de menu.
 * Agora:
 *  - só os 5 destinos de uso diário ficam na barra (DESTINOS_PRINCIPAIS);
 *  - notificações viram o sino, com o contador;
 *  - o resto (portfólio, validação, reputação, recarga EV, configurações,
 *    administração, sair) fica no menu do avatar, agrupado por assunto;
 *  - no celular, os 5 destinos vão para a barra inferior (BarraInferior)
 *    e aqui ficam só o logo, o sino e o avatar.
 *
 * O cabeçalho é desenhado UMA vez, pelo layout AreaLogada — as telas não o
 * importam mais (cada uma desenhava o seu, e por isso ele aparecia com
 * larguras e distâncias do topo diferentes de tela para tela).
 */
export default function HeaderInterface() {
  const naoLidas = useNotificacoesNaoLidas();

  useRolagemNoTopoAoTrocarDeRota();
  // Na área logada o logo aponta para a home social (/menu-user).
  const aoClicarLogo = useLogoAoTopo("/menu-user");

  useEffect(() => {
    document.body.style.backgroundColor = "var(--eco-bg)";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <header className="header-interface">
      <div className="header-interface-in">
        <Link
          to="/menu-user"
          className="site-marca"
          onClick={aoClicarLogo}
          aria-label="EcoNexo, ir para o início da comunidade"
        >
          <Marca />
          EcoNexo
        </Link>

        <nav aria-label="Área logada" className="header-interface-nav">
          <ul className="header-interface-links">
            {DESTINOS_PRINCIPAIS.map((d) => (
              <li key={d.to}>
                <NavLink to={d.to} end={d.fim}>
                  {d.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-interface-acoes">
          <NavLink
            to="/menu-user/notifications"
            className="header-interface-sino"
            aria-label={
              naoLidas > 0
                ? `Notificações, ${naoLidas} não lidas`
                : "Notificações"
            }
          >
            <IconBell size={20} stroke={1.6} aria-hidden="true" />
            {naoLidas > 0 && (
              <b className="notif-selo" aria-hidden="true">
                {naoLidas > 99 ? "99+" : naoLidas}
              </b>
            )}
          </NavLink>

          <PerfilMenu />
        </div>
      </div>
    </header>
  );
}
