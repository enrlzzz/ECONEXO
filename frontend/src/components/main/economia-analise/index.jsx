import "./index.css";

import { useEffect, useRef, useState } from "react";
import { FiFileText, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { FiAlertTriangle, FiCheck, FiLock } from "react-icons/fi";

import { economiaService } from "../../../services/economia";
import { extrairTextoDoPdf } from "./extrairPdf";

export const MIN_CONTAS = 2;
const MAX_CONTAS = 6;

/**
 * As quatro etapas que o usuário vê enquanto espera.
 *
 * A análise em si é uma chamada só, sem streaming — não há como saber o
 * progresso real da IA. Em vez de mentir com uma porcentagem inventada, a
 * barra mostra o progresso REAL da parte que é medível (a leitura dos
 * PDFs, 0→40%) e, a partir daí, uma rampa que desacelera e trava em 92%
 * até a resposta chegar. Nunca finge ter terminado.
 */
const ETAPAS = [
  { rotulo: "Lendo os PDFs", detalhe: "Extraindo o texto de cada conta." },
  { rotulo: "Identificando consumo e tarifas", detalhe: "Procurando kWh, bandeira e impostos." },
  { rotulo: "Comparando os meses", detalhe: "Cruzando as contas para achar o que mudou." },
  { rotulo: "Gerando recomendações", detalhe: "Estimando economia com geração solar." },
];

let sequencia = 0;

export default function EconomiaAnalise() {
  const [arquivos, setArquivos] = useState([]);
  const [arrastando, setArrastando] = useState(false);
  const [fase, setFase] = useState("ocioso"); // ocioso | processando | pronto | erro
  const [progresso, setProgresso] = useState(0);
  const [etapa, setEtapa] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [precisaEntrar, setPrecisaEntrar] = useState(false);

  const inputRef = useRef(null);
  const rampaRef = useRef(null);

  // A rampa é um intervalo; se o componente sair da tela no meio da
  // análise ele precisa morrer junto, senão fica atualizando estado de um
  // componente desmontado.
  useEffect(() => () => clearInterval(rampaRef.current), []);

  const processando = fase === "processando";
  const suficiente = arquivos.length >= MIN_CONTAS;

  function adicionar(lista) {
    const pdfs = Array.from(lista).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );

    if (pdfs.length !== lista.length) {
      setErro("Só aceito PDF. Os outros arquivos foram ignorados.");
    }

    setArquivos((atuais) => {
      // Mesmo nome e mesmo tamanho = a mesma conta enviada duas vezes.
      // Deixar passar faria a IA "comparar" um mês com ele mesmo.
      const chaves = new Set(atuais.map((a) => `${a.file.name}:${a.file.size}`));
      const novos = pdfs
        .filter((f) => !chaves.has(`${f.name}:${f.size}`))
        .map((file) => ({ id: ++sequencia, file }));

      return [...atuais, ...novos].slice(0, MAX_CONTAS);
    });
  }

  function remover(id) {
    setArquivos((atuais) => atuais.filter((a) => a.id !== id));
  }

  function limparResultado() {
    setResultado(null);
    setErro(null);
    setPrecisaEntrar(false);
    setFase("ocioso");
    setProgresso(0);
    setEtapa(0);
  }

  async function analisar(evento) {
    evento.preventDefault();
    if (!suficiente || processando) return;

    setFase("processando");
    setResultado(null);
    setErro(null);
    setPrecisaEntrar(false);
    setProgresso(2);
    setEtapa(0);

    try {
      // --- Fase medível: leitura dos PDFs, 0 → 40% ---
      const textos = [];
      for (let i = 0; i < arquivos.length; i++) {
        const base = (i / arquivos.length) * 40;
        const fatia = 40 / arquivos.length;
        const texto = await extrairTextoDoPdf(arquivos[i].file, (fracao) =>
          setProgresso(Math.round(base + fracao * fatia)),
        );
        textos.push(texto);
      }

      // --- Fase não medível: a rampa que trava em 92% ---
      setEtapa(1);
      setProgresso(42);
      rampaRef.current = setInterval(() => {
        setProgresso((atual) => {
          if (atual >= 92) return atual;
          // Quanto mais perto de 92, menor o passo: a barra desacelera
          // em vez de bater no teto e ficar parada de repente.
          const passo = Math.max(0.4, (92 - atual) / 22);
          const proximo = atual + passo;
          if (proximo > 58) setEtapa((e) => Math.max(e, 2));
          if (proximo > 76) setEtapa((e) => Math.max(e, 3));
          return proximo;
        });
      }, 220);

      const resposta = await economiaService.analisar(textos);

      clearInterval(rampaRef.current);
      setProgresso(100);
      setResultado(resposta);
      setFase("pronto");
    } catch (e) {
      clearInterval(rampaRef.current);
      setProgresso(0);
      setFase("erro");

      // O validador vive na home pública, mas /api/economia/analisar exige
      // token. Em vez de deixar o api.js derrubar a sessão e jogar o
      // visitante no /login sem explicação, o card assume o estado de
      // "entre para analisar".
      if (e.status === 401) {
        setPrecisaEntrar(true);
      } else {
        setErro(e.message || "Não foi possível analisar as contas agora.");
      }
    }
  }

  return (
    <section className="economia" id="validador-economia">
      <header className="economia-cabecalho">
        <span className="economia-kicker">Economia solar inteligente</span>
        <h2>Entenda sua conta CPFL</h2>
        <p>
          Envie pelo menos duas contas de energia em PDF. Comparando meses
          diferentes dá para separar o que é consumo real do que é bandeira,
          imposto ou reajuste — e estimar quanto a geração solar cobriria.
        </p>
      </header>

      <form className="economia-form" onSubmit={analisar}>
        <div
          className={`economia-dropzone eco-dropzone${arrastando ? " eco-dropzone--drag" : ""}`}
          onClick={() => !processando && inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            setArrastando(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            if (!processando) adicionar(e.dataTransfer.files);
          }}
        >
          <span className="economia-upload-icone" aria-hidden="true">
            <FiUploadCloud />
          </span>
          <strong>Arraste as contas em PDF ou clique para escolher</strong>
          <span className="economia-dropzone-dica">
            Mínimo de {MIN_CONTAS} contas • até {MAX_CONTAS} • 10 MB cada
          </span>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            hidden
            onChange={(e) => {
              adicionar(e.target.files);
              // Permite reenviar o mesmo arquivo depois de removê-lo.
              e.target.value = "";
            }}
          />
        </div>

        {arquivos.length > 0 && (
          <ul className="economia-lista">
            {arquivos.map(({ id, file }) => (
              <li key={id} className="economia-item">
                <span className="economia-item-icone" aria-hidden="true">
                  <FiFileText />
                </span>
                <div className="economia-item-texto">
                  <strong title={file.name}>{file.name}</strong>
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button
                  type="button"
                  className="economia-remover"
                  onClick={() => remover(id)}
                  disabled={processando}
                  aria-label={`Remover ${file.name}`}
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="economia-rodape">
          <span className="economia-contador">
            {arquivos.length === 0
              ? "Nenhuma conta enviada"
              : `${arquivos.length} de ${MAX_CONTAS} contas`}
            {arquivos.length > 0 && !suficiente && (
              <em> — faltam {MIN_CONTAS - arquivos.length} para comparar</em>
            )}
          </span>

          <button
            type="submit"
            className="eco-btn eco-btn--on-dark eco-btn--rich"
            disabled={!suficiente || processando}
          >
            {processando ? (
              <>
                <span className="eco-bars" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, i) => (
                    <i key={i} />
                  ))}
                </span>
                Analisando…
              </>
            ) : (
              "Analisar economia"
            )}
          </button>
        </div>
      </form>

      {processando && (
        <div
          className="economia-progresso"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="economia-progresso-topo">
            <strong>{ETAPAS[etapa].rotulo}</strong>
            <span>{Math.round(progresso)}%</span>
          </div>

          <div
            className="eco-progress"
            role="progressbar"
            aria-valuenow={Math.round(progresso)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso da análise"
          >
            <span style={{ "--valor": `${progresso}%` }} />
          </div>

          <ol className="economia-etapas">
            {ETAPAS.map((item, indice) => (
              <li
                key={item.rotulo}
                className={
                  indice < etapa
                    ? "concluida"
                    : indice === etapa
                      ? "atual"
                      : undefined
                }
              >
                <span className="economia-etapa-marca" aria-hidden="true">
                  {indice < etapa ? <FiCheck /> : indice + 1}
                </span>
                <div>
                  <strong>{item.rotulo}</strong>
                  <span>{item.detalhe}</span>
                </div>
              </li>
            ))}
          </ol>

          <div className="economia-esqueleto" aria-hidden="true">
            <div className="eco-skeleton eco-skeleton--text" style={{ width: "92%" }} />
            <div className="eco-skeleton eco-skeleton--text" style={{ width: "78%" }} />
            <div className="eco-skeleton eco-skeleton--text" style={{ width: "85%" }} />
          </div>
        </div>
      )}

      {/* Erro e resultado em lugares SEPARADOS. Antes a mensagem de falha
          era renderizada dentro do card de resultado, como se a IA tivesse
          respondido aquilo. */}
      {precisaEntrar && (
        <div className="economia-aviso economia-aviso--login" role="alert">
          <span aria-hidden="true">
            <FiLock />
          </span>
          <div>
            <strong>Entre para analisar sua conta</strong>
            <p>
              A análise consome a IA da plataforma, então pede uma conta
              EcoNexo. Seus PDFs continuam no seu navegador — só o texto
              extraído é enviado.
            </p>
            <a className="eco-btn eco-btn--outline-dark" href="/login">
              Entrar
            </a>
          </div>
        </div>
      )}

      {erro && (
        <div className="economia-aviso economia-aviso--erro" role="alert">
          <span aria-hidden="true">
            <FiAlertTriangle />
          </span>
          <div>
            <strong>Não deu para analisar</strong>
            <p>{erro}</p>
          </div>
        </div>
      )}

      {fase === "pronto" && resultado && (
        <article className="economia-resultado">
          <header>
            <strong>Resultado da análise</strong>
            {resultado.fonte && <span className="eco-badge eco-badge--info">{resultado.fonte}</span>}
          </header>
          <p>{resultado.analise}</p>
          <button type="button" className="eco-btn eco-btn--outline-dark" onClick={limparResultado}>
            Analisar outras contas
          </button>
        </article>
      )}
    </section>
  );
}
