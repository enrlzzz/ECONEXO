import "./index.css";
import "/src/variables.css";

import { Link, useNavigate } from "react-router-dom";

import { BsLightning } from "react-icons/bs";
import { useEffect, useState } from "react";

import { usuariosService } from "../../services/usuarios";
import { isLoggedIn, persistSession } from "../../userSession";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Login persistente: se já houver sessão, vai direto para a área logada
  useEffect(() => {
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
          <label htmlFor="email" className="label-name">Email</label>
          <input
            type="email"
            placeholder="seu@email.com"
            id="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
          />

          <label htmlFor="senha" className="label-password">Senha</label>
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
