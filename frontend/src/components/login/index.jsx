import "./index.css";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PaginaPublica from "../layout/PaginaPublica";
import { entrar, entrarComGoogle } from "../../auth/sessao";
import { aquecerApi } from "../../services/api";
import { isLoggedIn } from "../../userSession";
import { BotaoEnviar, ConfirmarEmail, IconeGoogle } from "./conta";
import { useAposEntrar } from "./useAposEntrar";

export default function Login() {
  const navigate = useNavigate();
  const seguir = useAposEntrar();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(null); // null | "email" | "google"
  const [demorando, setDemorando] = useState(false);
  const [confirmacao, setConfirmacao] = useState(null);

  // O backend (plano gratuito do Render) dorme; acorda enquanto a pessoa digita.
  useEffect(() => {
    aquecerApi();
    if (isLoggedIn()) navigate("/perfil", { replace: true });
  }, [navigate]);

  async function executar(tipo, acao) {
    setErro("");
    setEnviando(tipo);
    const aviso = setTimeout(() => setDemorando(true), 5000);
    try {
      seguir(await acao(), setConfirmacao);
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
          {confirmacao !== null ? (
            <ConfirmarEmail mensagem={confirmacao} aoConcluir={(r) => seguir(r, setConfirmacao)} />
          ) : (
            <>
              <div>
                <h1>Entrar</h1>
                <p className="eco-pequeno eco-mudo">Acesse seu histórico de análises e o painel profissional.</p>
              </div>

              <button
                type="button"
                className="eco-btn eco-btn--ghost"
                onClick={() => executar("google", entrarComGoogle)}
                disabled={enviando !== null}
                aria-busy={enviando === "google" || undefined}
              >
                {enviando === "google" ? <span className="eco-giro" aria-hidden="true" /> : <IconeGoogle />}
                Continuar com Google
              </button>

              <div className="eco-divisor">ou com e-mail</div>

              <form onSubmit={aoEnviar} noValidate>
                <div className="eco-field">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="eco-field">
                  <div className="auth-rotulo-linha">
                    <label htmlFor="senha">Senha</label>
                    <Link className="eco-link eco-pequeno" to="/recuperar-senha">Esqueceu a senha?</Link>
                  </div>
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
          )}
        </div>
      </section>
    </PaginaPublica>
  );
}
