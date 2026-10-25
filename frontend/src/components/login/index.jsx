import "./index.css";
import "/src/variables.css";

import { Link, useNavigate } from "react-router-dom";

import { BsLightning } from "react-icons/bs";
import { useEffect, useState } from "react";

import { aquecerApi } from "../../services/api";
import { usuariosService } from "../../services/usuarios";
import { isLoggedIn, persistSession } from "../../userSession";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [demorando, setDemorando] = useState(false);

  // Enquanto a pessoa digita, o servidor (plano gratuito, dorme após alguns
  // minutos parado) já pode estar acordando.
  useEffect(() => {
    aquecerApi();
  }, []);

  // Login persistente: se já houver sessão, vai direto para a área logada
  useEffect(() => {
    // Sem PerfilMenu nesta tela de propósito: quem já tem sessão é levado
    // direto para a timeline, então o menu nunca chegaria a aparecer.
    if (isLoggedIn()) navigate("/menu-user", { replace: true });
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    // Passou de 5 s: quase certamente o servidor estava dormindo. Sem este
    // aviso o botão parece travado e a pessoa clica de novo, ou desiste.
    const aviso = setTimeout(() => setDemorando(true), 5000);

    try {
      // Resposta: { token, expiraEmSegundos, usuario }
      const sessao = await usuariosService.login(form.email, form.senha);
      persistSession(sessao);
      navigate("/menu-user", { replace: true });
    } catch (e) {
      setErro(
        e.status === 401
          ? "Email ou senha incorretos."
          : e.status === 429
            ? e.message // "Excesso de tentativas. Tente novamente em N minuto(s)."
            : `Falha ao entrar: ${e.message}`,
      );
    } finally {
      clearTimeout(aviso);
      setDemorando(false);
      setEnviando(false);
    }
  };

  return (
    <div className="login-container">
      <Link to="/">
        <div className="logos-menu">
          <span className="logo-title-menu">
            <BsLightning />
          </span>
          <span className="title-menu">EcoNexo</span>
        </div>
      </Link>

      <div className="login-user">
        <h3>Entrar na Plataforma</h3>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="label-name">
            Email
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            id="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
          />

          <label htmlFor="senha" className="label-password">
            Senha
          </label>
          <input
            type="password"
            placeholder="********"
            id="senha"
            name="senha"
            required
            value={form.senha}
            onChange={handleChange}
          />

          {erro && <p style={{ color: "red" }}>{erro}</p>}

          {demorando && (
            <p className="login-demora" role="status">
              O servidor estava em repouso e está acordando — na primeira vez
              isso pode levar até 1 minuto. Aguarde, não precisa clicar de novo.
            </p>
          )}

          <div className="submit-container">
            <span className="no-password">Esqueceu a senha?</span>

            <button type="submit" className="login-submit" disabled={enviando}>
              {enviando ? "Entrando..." : "Entrar"}
            </button>

            <span>
              Não tem uma conta?{" "}
              <Link to="/register">
                <span className="register-account">Cadastre-se</span>
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
