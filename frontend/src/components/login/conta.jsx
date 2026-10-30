import { useState } from "react";

import { reenviarConfirmacao, sair, tentarVincularDeNovo } from "../../auth/sessao";

/** Botão pill com estado "carregando" acessível. */
export function BotaoEnviar({ carregando, rotulo, rotuloCarregando, className = "eco-btn--primary", ...props }) {
  return (
    <button
      type="submit"
      className={`eco-btn ${className}`}
      disabled={carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      {carregando && <span className="eco-giro" aria-hidden="true" />}
      {carregando ? rotuloCarregando : rotulo}
    </button>
  );
}

export function IconeGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2.1 5-4.4 6.6v5.5h7.1c4.2-3.9 6.5-9.6 6.5-16.1z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41 15.5 46 24 46z" />
      <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.1 2 20.4 2 24s1 6.9 2.5 9.9z" />
      <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.5 2 8.1 7 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" />
    </svg>
  );
}

/**
 * Conta antiga (do login anterior) com o mesmo e-mail: o vínculo só sai com
 * o e-mail confirmado. Aqui a pessoa reenvia o link ou avisa que já clicou.
 */
export function ConfirmarEmail({ mensagem, aoConcluir }) {
  const [estado, setEstado] = useState({ carregando: false, aviso: "", erro: "" });

  const jaConfirmei = async () => {
    setEstado({ carregando: true, aviso: "", erro: "" });
    try {
      const r = await tentarVincularDeNovo();
      if (r.status === "confirmar-email") {
        setEstado({ carregando: false, aviso: "", erro: "Ainda não recebemos a confirmação. Abra o link do e-mail e tente de novo." });
      } else {
        aoConcluir(r);
      }
    } catch (e) {
      setEstado({ carregando: false, aviso: "", erro: e.message });
    }
  };

  const reenviar = async () => {
    try {
      await reenviarConfirmacao();
      setEstado((s) => ({ ...s, aviso: "Link reenviado. Confira também a caixa de spam.", erro: "" }));
    } catch (e) {
      setEstado((s) => ({ ...s, erro: e.message }));
    }
  };

  return (
    <div className="auth-confirmar" role="status">
      <h2 className="eco-titulo-card">Confirme seu e-mail</h2>
      <p className="eco-pequeno eco-mudo">
        {mensagem || "Encontramos uma conta com este e-mail."} Depois de abrir o link, volte aqui.
      </p>
      {estado.aviso && <p className="eco-alerta eco-alerta--ok">{estado.aviso}</p>}
      {estado.erro && <p className="eco-alerta eco-alerta--erro" role="alert">{estado.erro}</p>}
      <div className="eco-acoes">
        <button type="button" className="eco-btn eco-btn--primary" onClick={jaConfirmei} disabled={estado.carregando} aria-busy={estado.carregando || undefined}>
          {estado.carregando && <span className="eco-giro" aria-hidden="true" />}
          Já confirmei
        </button>
        <button type="button" className="eco-btn eco-btn--texto" onClick={reenviar}>Reenviar link</button>
        <button type="button" className="eco-btn eco-btn--texto" onClick={() => sair()}>Usar outra conta</button>
      </div>
    </div>
  );
}
