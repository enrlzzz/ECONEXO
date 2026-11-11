import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUser } from "../../../userSession";
import { usuariosService } from "../../../services/usuarios";
import { profissionaisService } from "../../../services/profissionais";
import { avatarDe, regiaoDe, tipoProfissionalLabel } from "../../../format";
import { COMPLEMENTARES, filtrarMatch } from "./filtros";
import "./index.css";

export default function Match() {
  const [dados, setDados] = useState({ carregando: true, usuario: null, lista: [], erro: "" });
  const [filtros, setFiltros] = useState({ cidade: "", estado: "", tipo: "" });
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let ativo = true;
    const id = getUser()?.id;
    const pedido = id ? usuariosService.buscarPorId(id) : Promise.reject(new Error("Não foi possível identificar sua conta."));
    pedido.then((usuario) => ativo && setDados({ carregando: Boolean(COMPLEMENTARES[usuario.tipoProfissional]?.length), usuario, lista: [], erro: "" }))
      .catch((e) => ativo && setDados({ carregando: false, usuario: null, lista: [], erro: e.message || "Não foi possível carregar seu perfil." }));
    return () => { ativo = false; };
  }, [tentativa]);
  useEffect(() => {
    const tipos = COMPLEMENTARES[dados.usuario?.tipoProfissional] || [];
    if (!tipos.length) return undefined;
    let ativo = true;
    const timer = setTimeout(() => {
      const selecionados = filtros.tipo ? tipos.filter((tipo) => tipo === filtros.tipo) : tipos;
      Promise.all(selecionados.map((tipo) => profissionaisService.buscar({ tipo, cidade: filtros.cidade, estado: filtros.estado })))
        .then((listas) => ativo && setDados((d) => ({ ...d, carregando: false, lista: listas.flat(), erro: "" })))
        .catch((e) => ativo && setDados((d) => ({ ...d, carregando: false, erro: e.message || "Não foi possível carregar os profissionais." })));
    }, 300);
    return () => { ativo = false; clearTimeout(timer); };
  }, [dados.usuario, filtros]);
  const tipos = COMPLEMENTARES[dados.usuario?.tipoProfissional] || [];
  const resultados = dados.usuario ? filtrarMatch(dados.lista, dados.usuario, filtros) : [];
  const alterar = (e) => {
    const { name, value } = e.target;
    setDados((d) => ({ ...d, carregando: true }));
    setFiltros((f) => ({ ...f, [name]: value }));
  };
  return (
    <div className="pg">
      <header className="pg-cabeca"><div><h1 className="pg-titulo">Match profissional</h1><p className="pg-sub">Encontre perfis complementares para seus projetos.</p></div></header>
      {dados.carregando && !dados.usuario ? <p role="status">Carregando perfil…</p> : dados.erro ? (
        <div className="pg-vazio" role="alert"><p>{dados.erro}</p><button className="eco-btn eco-btn--ghost" type="button" onClick={() => { setDados({ carregando: true, usuario: null, lista: [], erro: "" }); setTentativa((n) => n + 1); }}>Tentar novamente</button></div>
      ) : tipos.length === 0 ? (
        <div className="pg-vazio"><h2>Informe seu perfil profissional</h2><p>Escolha seu tipo em configurações para encontrar profissionais complementares.</p><Link className="eco-btn eco-btn--primary" to="/menu-user/settings">Completar perfil</Link></div>
      ) : <>
        <p className="eco-mudo">Seu perfil: {tipoProfissionalLabel(dados.usuario.tipoProfissional)}. Os resultados incluem {tipos.map(tipoProfissionalLabel).join(" e ")}, conforme o tipo informado no cadastro.</p>
        <form className="match-filtros" onSubmit={(e) => e.preventDefault()}>
          <div className="eco-field"><label htmlFor="match-tipo">Perfil</label><select id="match-tipo" name="tipo" value={filtros.tipo} onChange={alterar}><option value="">Todos os complementares</option>{tipos.map((t) => <option key={t} value={t}>{tipoProfissionalLabel(t)}</option>)}</select></div>
          <div className="eco-field"><label htmlFor="match-cidade">Cidade</label><input id="match-cidade" name="cidade" value={filtros.cidade} onChange={alterar} placeholder="Ex.: Sorocaba" /></div>
          <div className="eco-field"><label htmlFor="match-estado">Estado (UF)</label><input id="match-estado" name="estado" value={filtros.estado} onChange={alterar} maxLength={2} placeholder="SP" /></div>
        </form>
        <p className="eco-mudo">A busca mostra até 50 pessoas por perfil. Use os filtros para refinar os resultados.</p>
        <p role="status" className="eco-mudo">{dados.carregando ? "Buscando profissionais…" : `${resultados.length} ${resultados.length === 1 ? "profissional encontrado" : "profissionais encontrados"}`}</p>
        {!dados.carregando && (resultados.length ? <ul className="match-lista">{resultados.map((p) => { const a = avatarDe(p); return <li className="match-cartao" key={p.idUsuario}><div className="match-pessoa"><span className="match-avatar" style={{ background: a.color }} aria-hidden="true">{a.initials}</span><div><h2>{p.nome}</h2><p>{tipoProfissionalLabel(p.tipoProfissional)} · {regiaoDe(p) || "Região não informada"}</p></div></div><p>{p.mediaAvaliacoes == null ? "Sem avaliações" : `${p.mediaAvaliacoes.toFixed(1).replace(".", ",")} · ${p.totalAvaliacoes} avaliação(ões)`}{p.creaVerificado ? " · CREA verificado" : ""}</p><div className="match-acoes"><Link className="eco-btn eco-btn--primary eco-btn--sm" to={`/menu-user/profile?id=${p.idUsuario}`} state={{ origem: "match" }}>Ver perfil</Link><Link className="eco-btn eco-btn--ghost eco-btn--sm" to={`/menu-user/messages?com=${p.idUsuario}`}>Enviar mensagem</Link></div></li>; })}</ul> : <div className="pg-vazio"><h2>Nenhum profissional encontrado</h2><p>Tente ajustar os filtros de cidade ou estado.</p><button type="button" className="eco-btn eco-btn--ghost" onClick={() => { setDados((d) => ({ ...d, carregando: true })); setFiltros({ cidade: "", estado: "", tipo: "" }); }}>Limpar filtros</button></div>)}
      </>}
    </div>
  );
}
