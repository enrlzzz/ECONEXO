import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  IconChevronRight,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconSearch,
  IconSelector,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";

import { sair } from "../../auth/sessao";
import { isAdmin } from "../../userSession";
import { useUserData } from "../../useUserData";
import { useNotificacoesNaoLidas } from "../../useNotificacoesNaoLidas";
import { useLogoAoTopo } from "../../scrollSuave";
import Marca from "../shared/marca";
import { DESTINOS_PRINCIPAIS, GRUPOS_DO_MENU } from "./destinos";

function grupoDaRota(pathname) {
  return GRUPOS_DO_MENU.find((g) => g.itens.some((i) => pathname === i.to || pathname.startsWith(`${i.to}/`)))?.id;
}

function Item({ destino, recolhida, naoLidas }) {
  const Icone = destino.Icone;
  const selo = destino.selo && naoLidas > 0 ? (naoLidas > 99 ? "99+" : String(naoLidas)) : null;
  return (
    <NavLink
      to={destino.to}
      end={destino.fim}
      className="lateral-item"
      title={recolhida ? destino.rotulo : undefined}
      aria-label={selo ? `${destino.rotulo}, ${selo} não lidas` : undefined}
    >
      <Icone size={20} stroke={1.6} aria-hidden="true" />
      <span className="lateral-rotulo">{destino.rotulo}</span>
      {selo && <b className="lateral-selo" aria-hidden="true">{selo}</b>}
    </NavLink>
  );
}

/**
 * Barra lateral da área logada: atalho de busca, destinos principais,
 * seções que abrem e fecham, botão de recolher e o perfil no canto
 * inferior esquerdo. Recolhida, vira uma coluna só de ícones.
 *
 * No celular ela é uma gaveta: `aberta` / `aoFechar` vêm do layout, que
 * desenha a barra de topo com o botão que a abre.
 */
export default function BarraLateral({ recolhida, aoAlternar, aberta, aoFechar }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const aoClicarLogo = useLogoAoTopo("/menu-user");
  const naoLidas = useNotificacoesNaoLidas();
  const { nome, initials, color } = useUserData();

  const [abertos, setAbertos] = useState(() => new Set([grupoDaRota(pathname)].filter(Boolean)));
  const [rota, setRota] = useState(pathname);
  const [contaAberta, setContaAberta] = useState(false);
  const raizConta = useRef(null);

  // Mudou de tela: abre a seção dela e fecha o menu da conta (ajuste de
  // estado durante o render, como no header público).
  if (rota !== pathname) {
    setRota(pathname);
    const grupo = grupoDaRota(pathname);
    if (grupo && !abertos.has(grupo)) setAbertos(new Set([...abertos, grupo]));
    setContaAberta(false);
  }

  // ...e fecha a gaveta do celular, que é estado do layout.
  useEffect(() => {
    aoFechar();
  }, [pathname, aoFechar]);

  // Atalho "[": recolhe ou expande, como no exemplo. Ignora quem está digitando.
  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key !== "[" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
      aoAlternar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aoAlternar]);

  useEffect(() => {
    if (!contaAberta) return undefined;
    const aoTeclar = (e) => e.key === "Escape" && setContaAberta(false);
    const aoClicarFora = (e) => !raizConta.current?.contains(e.target) && setContaAberta(false);
    window.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoClicarFora);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoClicarFora);
    };
  }, [contaAberta]);

  const alternarGrupo = (id) => {
    const proximo = new Set(abertos);
    if (proximo.has(id)) proximo.delete(id);
    else proximo.add(id);
    setAbertos(proximo);
  };

  const aoSair = async () => {
    setContaAberta(false);
    await sair();
    navigate("/", { replace: true });
  };

  const admin = isAdmin();

  return (
    <>
      {aberta && <div className="lateral-fundo" onClick={aoFechar} aria-hidden="true" />}
      <aside
        className={`lateral${recolhida ? " is-recolhida" : ""}${aberta ? " is-aberta" : ""}`}
        aria-label="Menu principal"
      >
        <div className="lateral-painel">
          <Link to="/menu-user" className="lateral-marca" onClick={aoClicarLogo} aria-label="EcoNexo, ir para a comunidade">
            <Marca tamanho={28} />
            <span className="lateral-rotulo">EcoNexo</span>
          </Link>

          <Link
            to="/menu-user/buscar"
            className="lateral-busca"
            title={recolhida ? "Buscar profissionais" : undefined}
          >
            <IconSearch size={18} stroke={1.6} aria-hidden="true" />
            <span className="lateral-rotulo">Buscar profissionais…</span>
          </Link>

          <nav className="lateral-nav" aria-label="Área logada">
            <div className="lateral-bloco">
              {DESTINOS_PRINCIPAIS.map((d) => (
                <Item key={d.to} destino={d} recolhida={recolhida} naoLidas={naoLidas} />
              ))}
            </div>

            {GRUPOS_DO_MENU.map((g) => {
              const itens = g.itens.filter((i) => !i.soAdmin || admin);
              const aberto = abertos.has(g.id);
              return (
                <div className="lateral-grupo" key={g.id}>
                  <button
                    type="button"
                    className="lateral-grupo-cabeca"
                    aria-expanded={aberto}
                    aria-controls={`grupo-${g.id}`}
                    onClick={() => alternarGrupo(g.id)}
                  >
                    <span className="lateral-rotulo">{g.rotulo}</span>
                    <IconChevronRight size={16} stroke={1.8} aria-hidden="true" className="lateral-seta" />
                  </button>
                  <div
                    id={`grupo-${g.id}`}
                    className={`lateral-grupo-itens${aberto ? " is-aberto" : ""}`}
                  >
                    {itens.map((i) => (
                      <Item key={i.to} destino={i} recolhida={recolhida} naoLidas={naoLidas} />
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="lateral-rodape">
            <button
              type="button"
              className="lateral-item lateral-recolher"
              onClick={aoAlternar}
              aria-expanded={!recolhida}
              title={recolhida ? "Expandir menu" : undefined}
            >
              {recolhida ? (
                <IconLayoutSidebarLeftExpand size={20} stroke={1.6} aria-hidden="true" />
              ) : (
                <IconLayoutSidebarLeftCollapse size={20} stroke={1.6} aria-hidden="true" />
              )}
              <span className="lateral-rotulo">{recolhida ? "Expandir menu" : "Recolher menu"}</span>
              <kbd className="lateral-tecla lateral-rotulo" aria-hidden="true">[</kbd>
            </button>

            <div className="lateral-conta" ref={raizConta}>
              {contaAberta && (
                <div className="lateral-conta-menu" role="menu">
                  <Link role="menuitem" to="/menu-user/profile"><IconUser size={18} stroke={1.6} aria-hidden="true" />Perfil profissional</Link>
                  <Link role="menuitem" to="/menu-user/settings"><IconSettings size={18} stroke={1.6} aria-hidden="true" />Configurações</Link>
                  <button role="menuitem" type="button" onClick={aoSair}>
                    <IconLogout size={18} stroke={1.6} aria-hidden="true" />Sair
                  </button>
                </div>
              )}
              <button
                type="button"
                className="lateral-perfil"
                onClick={() => setContaAberta((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={contaAberta}
                aria-label={`Conta de ${nome || "usuário"}`}
              >
                <span className="lateral-avatar" style={{ background: color }}>{initials || "?"}</span>
                <span className="lateral-perfil-texto lateral-rotulo">
                  <strong>{nome || "Sua conta"}</strong>
                  <small><i aria-hidden="true" />Conectado</small>
                </span>
                <IconSelector size={18} stroke={1.6} aria-hidden="true" className="lateral-rotulo" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
