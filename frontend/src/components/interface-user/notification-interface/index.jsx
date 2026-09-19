import "./index.css";
import { useEffect, useState } from "react";
import HeaderInterface from "../header-interface";
import { notificacoesService } from "../../../services/notificacoes";

const icons = { MENSAGEM: "✉", CURTIDA: "♥", COMENTARIO: "◌", SEGUIU: "＋" };
export default function NotificationInterface() {
  const [items, setItems] = useState([]); const [error, setError] = useState("");
  useEffect(() => { notificacoesService.listar().then(setItems).then(() => notificacoesService.marcarLidas()).catch(e => setError(e.message)); }, []);
  return <div className="notifications-page"><HeaderInterface /><main className="notifications-container"><div className="notifications-title"><div><h1>Notificações</h1><p>Acompanhe interações e novas mensagens da sua rede.</p></div><button onClick={() => notificacoesService.marcarLidas()}>Marcar todas como lidas</button></div>{error && <p className="notification-error">{error}</p>}<section className="notifications-list">{items.length ? items.map(item => <article className={`notifications-item ${item.lida ? "read" : ""}`} key={item.idNotificacao}><span className="notification-icon">{icons[item.tipo] || "•"}</span><div><strong>{item.ator || "EcoNexo"}</strong><p>{item.texto}</p><small>{new Date(item.criadoEm).toLocaleString("pt-BR")}</small></div></article>) : <div className="notifications-empty"><span>✓</span><h2>Tudo em dia</h2><p>Quando alguém seguir você, enviar mensagem ou interagir com seus posts, avisaremos aqui.</p></div>}</section></main></div>;
}
