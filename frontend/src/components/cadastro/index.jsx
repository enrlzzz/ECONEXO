import "../login/index.css";

import { useState } from "react";
import { Link } from "react-router-dom";

import PaginaPublica from "../layout/PaginaPublica";
import { criarConta } from "../../auth/sessao";
import { BotaoEnviar } from "../login/conta";
import { useAposEntrar } from "../login/useAposEntrar";
import { CamposCadastro } from "../login/CamposCadastro";
import { DADOS_INICIAIS, paraApi } from "../login/cadastroDados";

export default function Cadastro() {
  const seguir = useAposEntrar();
  const [conta, setConta] = useState({ nome: "", email: "", senha: "", confirmarSenha: "" });
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [erro, setErro] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [enviando, setEnviando] = useState(null);

  const alterar = (parcial) => setDados((d) => ({ ...d, ...parcial }));

  async function aoEnviar(e) {
    e.preventDefault();
    setErro("");
    setErroSenha("");
    if (!conta.nome.trim() || !conta.email.trim()) {
      setErro("Preencha nome e e-mail.");
      return;
    }
    if (conta.senha.length < 8) {
      setErroSenha("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (conta.senha !== conta.confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }
    if (!dados.consentimentoLgpd) {
      setErro("Para criar a conta, aceite a Política de Privacidade.");
      return;
    }
    setEnviando("email");
    try {
      seguir(await criarConta(conta.email, conta.senha, paraApi(conta.nome, dados)));
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setEnviando(null);
    }
  }

  return (
    <PaginaPublica>
      <section className="auth-pagina">
        <div className="auth-card auth-card--largo">
          <>
              <div>
                <h1>Criar conta</h1>
                <p className="eco-pequeno eco-mudo">Leva um minuto. Os dados profissionais podem ser completados depois.</p>
              </div>

              <form onSubmit={aoEnviar} noValidate>
                <div className="eco-field">
                  <label htmlFor="nome">Nome completo</label>
                  <input id="nome" autoComplete="name" maxLength={100} required
                    value={conta.nome} onChange={(e) => setConta({ ...conta, nome: e.target.value })} />
                </div>
                <div className="eco-field">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" autoComplete="email" required
                    value={conta.email} onChange={(e) => setConta({ ...conta, email: e.target.value })} />
                </div>
                <div className="auth-linha-2">
                  <div className="eco-field">
                    <label htmlFor="senha">Senha</label>
                    <input id="senha" type="password" autoComplete="new-password" minLength={8} maxLength={72} required
                      aria-describedby="senha-ajuda" aria-invalid={erroSenha && conta.senha.length < 8 ? true : undefined}
                      value={conta.senha} onChange={(e) => setConta({ ...conta, senha: e.target.value })} />
                    <span className="auth-ajuda" id="senha-ajuda">Mínimo de 8 caracteres.</span>
                  </div>
                  <div className="eco-field">
                    <label htmlFor="confirmarSenha">Confirmar senha</label>
                    <input id="confirmarSenha" type="password" autoComplete="new-password" required
                      aria-invalid={erroSenha ? true : undefined} aria-describedby={erroSenha ? "senha-erro" : undefined}
                      value={conta.confirmarSenha} onChange={(e) => setConta({ ...conta, confirmarSenha: e.target.value })} />
                    {erroSenha && <span className="auth-erro-campo" id="senha-erro">{erroSenha}</span>}
                  </div>
                </div>

                <CamposCadastro dados={dados} alterar={alterar} />

                {erro && <p className="eco-alerta eco-alerta--erro" role="alert">{erro}</p>}

                <BotaoEnviar carregando={enviando === "email"} disabled={enviando !== null} rotulo="Criar conta" rotuloCarregando="Criando conta…" />
              </form>

              <p className="auth-rodape">
                Já tem conta? <Link className="eco-link" to="/login">Entrar</Link>
              </p>
          </>
        </div>
      </section>
    </PaginaPublica>
  );
}
