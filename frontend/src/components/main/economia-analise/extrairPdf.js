/**
 * Extração de texto de PDF no navegador.
 *
 * O pdf.js entra por import dinâmico de propósito: são ~350 kB que só
 * fazem sentido para quem realmente vai analisar uma conta. Carregar isso
 * no bundle inicial penalizaria todo mundo que só abriu a home.
 */

let pdfjsPromise = null;

async function carregarPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      // Worker empacotado pelo Vite (?worker) e instanciado aqui. Antes era
      // ?url, que publica um arquivo .pdf.worker.min.mjs: servidores que não
      // mapeiam .mjs para JavaScript (a Hostinger) o entregam como
      // octet-stream, o navegador recusa o módulo e a leitura falhava em
      // todo PDF — mesmo nos sem senha. O ?worker sai como .js.
      const Worker = (
        await import("pdfjs-dist/build/pdf.worker.min.mjs?worker")
      ).default;
      pdfjs.GlobalWorkerOptions.workerPort = new Worker();
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

/** Tamanho máximo por arquivo. Conta de luz não passa disso nem escaneada. */
export const TAMANHO_MAXIMO = 10 * 1024 * 1024;

/**
 * Lê um File e devolve o texto corrido de todas as páginas.
 *
 * @param {File} arquivo
 * @param {(fracao: number) => void} [aoProgredir] 0..1 dentro deste arquivo
 */
export async function extrairTextoDoPdf(arquivo, aoProgredir) {
  if (arquivo.size > TAMANHO_MAXIMO) {
    throw new Error(`${arquivo.name} passa de 10 MB.`);
  }

  const pdfjs = await carregarPdfjs();
  const buffer = await arquivo.arrayBuffer();

  let documento;
  try {
    documento = await pdfjs.getDocument({ data: buffer }).promise;
  } catch (e) {
    // Só chama de "senha" o que realmente é senha; o resto aparece no
    // console para dar para diagnosticar (antes tudo virava "senha").
    if (e?.name === "PasswordException") {
      throw new Error(`${arquivo.name} está protegido por senha. Baixe uma cópia sem senha e tente de novo.`);
    }
    console.error("Falha ao abrir o PDF", e);
    throw new Error(
      `Não consegui abrir ${arquivo.name}. Tente baixar o PDF de novo; se continuar, recarregue a página (Ctrl+F5).`,
    );
  }

  const paginas = [];
  for (let n = 1; n <= documento.numPages; n++) {
    const pagina = await documento.getPage(n);
    const conteudo = await pagina.getTextContent();
    paginas.push(conteudo.items.map((item) => item.str).join(" "));
    aoProgredir?.(n / documento.numPages);
  }

  const texto = paginas.join("\n").replace(/[ \t]{2,}/g, " ").trim();

  // PDF de conta digitalizada (imagem pura) não tem camada de texto.
  // Melhor avisar agora do que mandar string vazia para a IA e receber
  // uma análise inventada de volta.
  if (texto.length < 80) {
    throw new Error(
      `${arquivo.name} não tem texto selecionável — parece ser um PDF escaneado. Baixe a segunda via em PDF direto no site da CPFL.`,
    );
  }

  return texto;
}
