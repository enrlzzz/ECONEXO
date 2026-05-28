import "./index.css";
import "/src/variables.css";

import { Link, useNavigate } from "react-router-dom";

import { BsLightning } from "react-icons/bs";
import { useState } from "react";

import { usuariosService } from "../../services/usuarios";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const usuario = await usuariosService.login(form.email, form.senha);
      localStorage.setItem("userId", String(usuario.idUsuario));
      localStorage.setItem("userName", usuario.nome);
      localStorage.setItem("userEmail", usuario.email);
      navigate("/menu-user");
    } catch (e) {
      setErro(
        e.status === 401
          ? "Email ou senha incorretos."
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
