import "../login/index.css";

import { useState } from "react";
import { Link } from "react-router-dom";

import PaginaPublica from "../layout/PaginaPublica";
import { recuperarSenha } from "../../auth/sessao";
import { BotaoEnviar } from "../login/conta";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState({ enviando: false, enviado: false, erro: "" });

  async function aoEnviar(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEstado({ enviando: false, enviado: false, erro: "Digite um e-mail válido." });
      return;
    }
    setEstado({ enviando: true, enviado: false, erro: "" });
    try {
      await recuperarSenha(email);
      setEstado({ enviando: false, enviado: true, erro: "" });
    } catch (e2) {
      setEstado({ enviando: false, enviado: false, erro: e2.message });
    }
  }

  return (
    <PaginaPublica>
      <section className="auth-pagina">
        <div className="auth-card">
          <div>
            <h1>Recuperar senha</h1>
            <p className="eco-pequeno eco-mudo">Enviaremos um link para você criar uma nova senha.</p>
          </div>
          <form onSubmit={aoEnviar} noValidate>
            <div className="eco-field">
              <label htmlFor="email">E-mail da conta</label>
              <input id="email" type="email" autoComplete="email" required
                aria-invalid={estado.erro ? true : undefined}
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {estado.erro && <p className="eco-alerta eco-alerta--erro" role="alert">{estado.erro}</p>}
            {/* A mesma mensagem exista ou não a conta: não vira verificador de e-mails. */}
            {estado.enviado && (
              <p className="eco-alerta eco-alerta--ok" role="status">
                Se houver uma conta com esse e-mail, você vai receber o link em alguns minutos. Confira também a caixa de spam.
              </p>
            )}
            <BotaoEnviar carregando={estado.enviando} rotulo="Enviar link" rotuloCarregando="Enviando…" />
          </form>
          <p className="auth-rodape">
            <Link className="eco-link" to="/login">Voltar para entrar</Link>
          </p>
        </div>
      </section>
    </PaginaPublica>
  );
}
