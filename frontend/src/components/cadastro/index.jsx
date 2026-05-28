import "./index.css";
import "/src/variables.css";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { BsLightning } from "react-icons/bs";

import { usuariosService } from "../../services/usuarios";

export default function Cadastro() {
  const navigate = useNavigate();

  const [tipoConta, setTipoConta] = useState("engenheiro");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    telefone: "",
    dataNascimento: "",
    cidade: "",
    estado: "",
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");
    setEnviando(true);

    try {
      const novo = await usuariosService.criar({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        cpf: form.cpf || null,
        telefone: form.telefone || null,
        dataNascimento: form.dataNascimento || null,
      });

      localStorage.setItem("userId", String(novo.idUsuario));
      localStorage.setItem("userName", novo.nome);
      localStorage.setItem("userEmail", novo.email);
      localStorage.setItem("userCidade", form.cidade);
      localStorage.setItem("userEstado", form.estado);

      navigate("/menu-user");
    } catch (e) {
      setErro(
        e.status === 409 || /duplicate|unique/i.test(e.message)
          ? "Este email ou CPF já está cadastrado."
          : `Falha ao cadastrar: ${e.message}`,
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="register-container">
      <Link to="/">
        <div className="logos-menu">
          <span className="logo-title-menu">
            <BsLightning />
          </span>
          <span className="title-menu">EcoNexo</span>
        </div>
      </Link>

      <div className="register-user">
        <h3>Criar Conta</h3>
        <p>Escolha o tipo de conta e preencha seus dados</p>

        <div className="buttons-preference">
          <button
            type="button"
            className={tipoConta === "engenheiro" ? "ativo" : ""}
            onClick={() => setTipoConta("engenheiro")}
          >
            Engenheiro/Projetista
          </button>
          <button
            type="button"
            className={tipoConta === "instalador" ? "ativo" : ""}
            onClick={() => setTipoConta("instalador")}
          >
            Instalador
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="nome" className="label-name">Nome Completo</label>
          <input
            type="text"
            placeholder="Seu nome"
            id="nome"
            name="nome"
            required
            value={form.nome}
            onChange={handleChange}
          />

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

          <label htmlFor="cpf" className="label-name">CPF</label>
          <input
            type="text"
            placeholder="000.000.000-00"
            id="cpf"
            name="cpf"
            maxLength={14}
            value={form.cpf}
            onChange={handleChange}
          />

          <label htmlFor="telefone" className="label-name">Telefone</label>
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            id="telefone"
            name="telefone"
            maxLength={20}
            value={form.telefone}
            onChange={handleChange}
          />

          <label htmlFor="dataNascimento" className="label-name">Data de Nascimento</label>
          <input
            type="date"
            id="dataNascimento"
            name="dataNascimento"
            value={form.dataNascimento}
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

          <label htmlFor="confirmarSenha" className="label-password">Confirmar Senha</label>
          <input
            type="password"
            placeholder="********"
            id="confirmarSenha"
            name="confirmarSenha"
            required
            value={form.confirmarSenha}
            onChange={handleChange}
          />

          <label htmlFor="cidade" className="label-name">Cidade</label>
          <input
            type="text"
            placeholder="Sua cidade"
            id="cidade"
            name="cidade"
            value={form.cidade}
            onChange={handleChange}
          />

          <label htmlFor="estado" className="label-name">Estado</label>
          <select
            id="estado"
            name="estado"
            value={form.estado}
            onChange={handleChange}
          >
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>

          <p className="info-certificado">
            Campos profissionais (CREA / NR-10 / NR-35) serão habilitados em breve.
          </p>

          {erro && <p style={{ color: "red" }}>{erro}</p>}

          <button type="submit" className="button-register" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar"}
          </button>

          <span>
            Já tem uma conta?{" "}
            <Link to="/login">
              <span className="redirect-login">Faça login</span>
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}
