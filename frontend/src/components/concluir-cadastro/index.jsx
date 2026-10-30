import "../login/index.css";

import { useState } from "react";
import { Navigate } from "react-router-dom";

import PaginaPublica from "../layout/PaginaPublica";
import { useUsuarioFirebase } from "../../auth/useUsuarioFirebase";
import { concluirCadastro, sair } from "../../auth/sessao";
import { BotaoEnviar, ConfirmarEmail } from "../login/conta";
import { useAposEntrar } from "../login/useAposEntrar";
import { CamposCadastro } from "../login/CamposCadastro";
import { DADOS_INICIAIS, paraApi } from "../login/cadastroDados";

/**
 * Primeira entrada com Google: a conta existe no Firebase, mas o cadastro
 * daqui ainda não — falta o nome e, principalmente, o consentimento LGPD.
 */
export default function ConcluirCadastro() {
  const seguir = useAposEntrar();
  const { pronto, usuario: usuarioFirebase } = useUsuarioFirebase();
  // null = ainda não editado: mostra o nome que veio do Google.
  const [nomeEditado, setNome] = useState(null);
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmacao, setConfirmacao] = useState(null);

  const nome = nomeEditado ?? usuarioFirebase?.displayName ?? "";

  if (pronto && !usuarioFirebase) return <Navigate to="/login" replace />;
  if (!pronto) return null;

  async function aoEnviar(e) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }
    if (!dados.consentimentoLgpd) {
      setErro("Para concluir, aceite a Política de Privacidade.");
      return;
    }
    setEnviando(true);
    try {
      seguir(await concluirCadastro(paraApi(nome, dados)), setConfirmacao);
    } catch (e2) {
      setErro(e2.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <PaginaPublica>
      <section className="auth-pagina">
        <div className="auth-card auth-card--largo">
          {confirmacao !== null ? (
            <ConfirmarEmail mensagem={confirmacao} aoConcluir={(r) => seguir(r, setConfirmacao)} />
          ) : (
            <>
              <div>
                <h1>Falta pouco</h1>
                <p className="eco-pequeno eco-mudo">
                  Você entrou como {usuarioFirebase.email}. Confirme seus dados para concluir o cadastro.
                </p>
              </div>
              <form onSubmit={aoEnviar} noValidate>
                <div className="eco-field">
                  <label htmlFor="nome">Nome completo</label>
                  <input id="nome" autoComplete="name" maxLength={100} required value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
                <CamposCadastro dados={dados} alterar={(p) => setDados((d) => ({ ...d, ...p }))} />
                {erro && <p className="eco-alerta eco-alerta--erro" role="alert">{erro}</p>}
                <BotaoEnviar carregando={enviando} rotulo="Concluir cadastro" rotuloCarregando="Salvando…" />
              </form>
              <p className="auth-rodape">
                <button type="button" className="eco-btn eco-btn--texto" onClick={() => sair()}>Cancelar e sair</button>
              </p>
            </>
          )}
        </div>
      </section>
    </PaginaPublica>
  );
}
