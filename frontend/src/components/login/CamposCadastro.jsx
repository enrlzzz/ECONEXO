import { Link } from "react-router-dom";
import { ESTADOS } from "../../estados";

/**
 * Campos do cadastro enviados ao backend junto com e-mail e senha.
 * Usado em "Criar conta".
 *
 * `dados` tem: tipo ("cliente" | "PROJETISTA" | "INSTALADOR"), cidade,
 * estado, cpf, telefone, dataNascimento, consentimentoLgpd.
 */
export function CamposCadastro({ dados, alterar }) {
  const profissional = dados.tipo !== "cliente";
  const campo = (nome) => ({
    id: nome,
    value: dados[nome],
    onChange: (e) => alterar({ [nome]: e.target.value }),
  });

  return (
    <>
      <div className="eco-segmento" role="group" aria-label="Tipo de conta">
        <button type="button" aria-pressed={!profissional} onClick={() => alterar({ tipo: "cliente" })}>
          Quero analisar contas
        </button>
        <button type="button" aria-pressed={profissional} onClick={() => alterar({ tipo: "PROJETISTA" })}>
          Sou profissional
        </button>
      </div>

      {profissional && (
        <>
          <div className="eco-segmento" role="group" aria-label="Área de atuação">
            <button type="button" aria-pressed={dados.tipo === "PROJETISTA"} onClick={() => alterar({ tipo: "PROJETISTA" })}>
              Engenheiro/Projetista
            </button>
            <button type="button" aria-pressed={dados.tipo === "INSTALADOR"} onClick={() => alterar({ tipo: "INSTALADOR" })}>
              Instalador
            </button>
          </div>
          <p className="eco-pequeno eco-mudo">
            {dados.tipo === "INSTALADOR"
              ? "Instaladores precisam comprovar ao menos uma NR (NR-10 ou NR-35) na etapa de validação, depois do cadastro."
              : "Engenheiros e projetistas validam o CREA na etapa de validação, depois do cadastro."}
          </p>
        </>
      )}

      <div className="auth-linha-2">
        <div className="eco-field">
          <label htmlFor="cidade">Cidade</label>
          <input type="text" autoComplete="address-level2" maxLength={100} {...campo("cidade")} />
        </div>
        <div className="eco-field">
          <label htmlFor="estado">Estado</label>
          <select autoComplete="address-level1" {...campo("estado")}>
            <option value="">Selecione</option>
            {ESTADOS.map(([sigla, nome]) => (
              <option key={sigla} value={sigla}>{nome}</option>
            ))}
          </select>
        </div>
      </div>

      <details>
        <summary>Mais dados (opcional)</summary>
        <div className="auth-card-form-extra" style={{ display: "grid", gap: "1.8rem" }}>
          <div className="eco-field">
            <label htmlFor="cpf">CPF</label>
            <input type="text" inputMode="numeric" placeholder="000.000.000-00" maxLength={14} {...campo("cpf")} />
            <span className="auth-ajuda">Guardado criptografado. Nunca aparece para outros usuários.</span>
          </div>
          <div className="auth-linha-2">
            <div className="eco-field">
              <label htmlFor="telefone">Telefone</label>
              <input type="tel" autoComplete="tel" placeholder="(15) 99999-9999" maxLength={20} {...campo("telefone")} />
            </div>
            <div className="eco-field">
              <label htmlFor="dataNascimento">Data de nascimento</label>
              <input type="date" autoComplete="bday" {...campo("dataNascimento")} />
            </div>
          </div>
        </div>
      </details>

      {/* Começa desmarcado: checkbox pré-marcado não é consentimento válido. */}
      <label className="eco-check">
        <input
          type="checkbox"
          checked={dados.consentimentoLgpd}
          onChange={(e) => alterar({ consentimentoLgpd: e.target.checked })}
        />
        <span>
          Li e aceito a{" "}
          <Link className="eco-link" to="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">
            Política de Privacidade
          </Link>{" "}
          e autorizo o tratamento dos meus dados pessoais.
        </span>
      </label>
    </>
  );
}
