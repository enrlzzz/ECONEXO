import { api } from "./api";

/**
 * Análise das contas de energia.
 *
 * O backend recebe TEXTO, não arquivo: o PDF é lido no navegador
 * (ver components/main/economia-analise/extrairPdf.js) e só o texto
 * extraído sobe. Conta de luz tem nome, CPF e endereço do titular —
 * não fazer o arquivo trafegar nem ser gravado é o caminho mais curto
 * para não precisar tratá-lo como dado pessoal em repouso (LGPD).
 *
 * Pública: sem sessão, nada é salvo. Com sessão, a resposta volta com
 * idAnalise e entra no histórico.
 */
export const economiaService = {
  analisar: (contas) => api.post("/economia/analisar", { contas }),
  historico: () => api.get("/economia/historico"),
  detalhe: (id) => api.get(`/economia/historico/${id}`),
  excluir: (id) => api.delete(`/economia/historico/${id}`),
};
