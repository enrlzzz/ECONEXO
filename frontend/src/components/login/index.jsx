import "./index.css";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PaginaPublica from "../layout/PaginaPublica";
import { entrar } from "../../auth/sessao";
import { aquecerApi } from "../../services/api";
import { isLoggedIn } from "../../userSession";
import { BotaoEnviar } from "./conta";
import { useAposEntrar } from "./useAposEntrar";

export default function Login() {
  const navigate = useNavigate();
  const seguir = useAposEntrar();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(null); // null | "email"
  const [demorando, setDemorando] = useState(false);

  // O backend (plano gratuito do Render) dorme; acorda enquanto a pessoa digita.
  useEffect(() => {
    aquecerApi();
    if (isLoggedIn()) navigate("/menu-user", { replace: true });
  }, [navigate]);

  async function executar(tipo, acao) {
    setErro("");
    setEnviando(tipo);
    const aviso = setTimeout(() => setDemorando(true), 5000);
    try {
      seguir(await acao());
    } catch (e) {
      setErro(e.message);
    } finally {
      clearTimeout(aviso);
      setDemorando(false);
      setEnviando(null);
    }
  }

  const aoEnviar = (e) => {
    e.preventDefault();
    if (!form.email || !form.senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    executar("email", () => entrar(form.email, form.senha));
  };

  return (
    <PaginaPublica>
      <section className="auth-pagina">
        <div className="auth-card">
          <>
              <div>
                <h1>Entrar</h1>
                <p className="eco-pequeno eco-mudo">Acesse seu histórico de análises e o painel profissional.</p>
              </div>

              <form onSubmit={aoEnviar} noValidate>
                <div className="eco-field">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="eco-field">
                  <label htmlFor="senha">Senha</label>
                  <input id="senha" type="password" autoComplete="current-password" required
                    value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
                </div>

                {erro && <p className="eco-alerta eco-alerta--erro" role="alert">{erro}</p>}
                {demorando && (
                  <p className="eco-alerta eco-alerta--info auth-demora" role="status">
                    O servidor estava em repouso e está acordando. Na primeira vez isso pode levar até 1 minuto — não precisa clicar de novo.
                  </p>
                )}

                <BotaoEnviar carregando={enviando === "email"} disabled={enviando !== null} rotulo="Entrar" rotuloCarregando="Entrando…" />
              </form>

              <p className="auth-rodape">
                Ainda não tem conta? <Link className="eco-link" to="/register">Criar conta</Link>
              </p>
          </>
        </div>
      </section>
    </PaginaPublica>
  );
}
