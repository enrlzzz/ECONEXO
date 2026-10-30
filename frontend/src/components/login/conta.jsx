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
