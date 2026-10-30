/** Estado inicial e conversão dos campos de CamposCadastro. */
export const DADOS_INICIAIS = {
  tipo: "cliente",
  cidade: "",
  estado: "",
  cpf: "",
  telefone: "",
  dataNascimento: "",
  consentimentoLgpd: false,
};

/** Formato que POST /api/auth/firebase espera. Vazio vira null. */
export function paraApi(nome, dados) {
  const ou = (v) => (v && String(v).trim()) || null;
  return {
    nome: ou(nome),
    cidade: ou(dados.cidade),
    estado: ou(dados.estado),
    cpf: ou(dados.cpf),
    telefone: ou(dados.telefone),
    dataNascimento: ou(dados.dataNascimento),
    tipoProfissional: dados.tipo === "cliente" ? null : dados.tipo,
    consentimentoLgpd: dados.consentimentoLgpd,
  };
}
