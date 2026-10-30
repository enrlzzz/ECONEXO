import "./index.css";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { economiaService } from "../../../services/economia";
import { useLogado } from "../../../useUserData";
import { extrairTextoDoPdf } from "./extrairPdf";
import Resultado from "./Resultado";

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
  "Lendo os PDFs",
  "Identificando consumo e tarifas",
  "Comparando os meses",
  "Gerando recomendações",
];

let sequencia = 0;

/**
 * Análise de contas de energia. Pública: visitante analisa e vê o resultado
 * completo, sem salvar. Com sessão, o backend guarda no histórico (/perfil).
 */
export default function EconomiaAnalise() {
  const logado = useLogado();
  const [arquivos, setArquivos] = useState([]);
  const [arrastando, setArrastando] = useState(false);
  const [fase, setFase] = useState("ocioso"); // ocioso | processando | pronto | erro
  const [progresso, setProgresso] = useState(0);
  const [etapa, setEtapa] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  const inputRef = useRef(null);
  const rampaRef = useRef(null);
  const resultadoRef = useRef(null);

  // A rampa é um intervalo; se o componente sair da tela no meio da
  // análise ele precisa morrer junto.
  useEffect(() => () => clearInterval(rampaRef.current), []);

  const processando = fase === "processando";
  const suficiente = arquivos.length >= MIN_CONTAS;

  function adicionar(lista) {
    const todos = Array.from(lista);
    const pdfs = todos.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    setAviso(pdfs.length !== todos.length ? "Só aceitamos PDF. Os outros arquivos foram ignorados." : null);

    setArquivos((atuais) => {
      // Mesmo nome e mesmo tamanho = a mesma conta enviada duas vezes.
      const chaves = new Set(atuais.map((a) => `${a.file.name}:${a.file.size}`));
      const novos = pdfs
        .filter((f) => !chaves.has(`${f.name}:${f.size}`))
        .map((file) => ({ id: ++sequencia, file }));
      return [...atuais, ...novos].slice(0, MAX_CONTAS);
    });
  }

  const remover = (id) => setArquivos((atuais) => atuais.filter((a) => a.id !== id));

  function recomecar() {
    setResultado(null);
    setErro(null);
    setFase("ocioso");
    setProgresso(0);
    setEtapa(0);
    setArquivos([]);
  }

  async function analisar(evento) {
    evento.preventDefault();
    if (!suficiente || processando) return;

    setFase("processando");
    setResultado(null);
    setErro(null);
    setProgresso(2);
    setEtapa(0);

    try {
      // --- Fase medível: leitura dos PDFs, 0 → 40% ---
      const textos = [];
      for (let i = 0; i < arquivos.length; i++) {
        const base = (i / arquivos.length) * 40;
        const fatia = 40 / arquivos.length;
        textos.push(
          await extrairTextoDoPdf(arquivos[i].file, (fracao) =>
            setProgresso(Math.round(base + fracao * fatia)),
          ),
        );
      }

      // --- Fase não medível: a rampa que trava em 92% ---
      setEtapa(1);
      setProgresso(42);
      rampaRef.current = setInterval(() => {
        setProgresso((atual) => {
          if (atual >= 92) return atual;
          const proximo = atual + Math.max(0.4, (92 - atual) / 22);
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
      // Leva o foco ao resultado: quem usa leitor de tela ouve o título.
      requestAnimationFrame(() => resultadoRef.current?.focus());
    } catch (e) {
      clearInterval(rampaRef.current);
      setProgresso(0);
      setFase("erro");
      setErro(e.message || "Não foi possível analisar as contas agora. Tente de novo.");
    }
  }

  if (fase === "pronto" && resultado) {
    return (
      <div className="analise" ref={resultadoRef} tabIndex={-1}>
        <Resultado resultado={resultado} />
        <div className="analise-convite">
          {resultado.idAnalise ? (
            <>
              <p className="eco-corpo"><span aria-hidden="true">✓ </span><strong>Análise salva no seu perfil.</strong></p>
              <div className="eco-acoes">
                <Link className="eco-btn eco-btn--primary eco-btn--sm" to="/perfil">Ver histórico</Link>
                <button type="button" className="eco-btn eco-btn--ghost eco-btn--sm" onClick={recomecar}>Nova análise</button>
              </div>
            </>
          ) : logado ? (
            <>
              <p className="eco-corpo eco-mudo">Esta análise não foi salva no histórico.</p>
              <button type="button" className="eco-btn eco-btn--ghost eco-btn--sm" onClick={recomecar}>Nova análise</button>
            </>
          ) : (
            <>
              <p className="eco-corpo">
                <strong>Quer guardar esta análise?</strong>{" "}
                <span className="eco-mudo">Crie uma conta grátis e acompanhe suas contas mês a mês.</span>
              </p>
              <div className="eco-acoes">
                <Link className="eco-btn eco-btn--primary eco-btn--sm" to="/register">Criar conta</Link>
                <button type="button" className="eco-btn eco-btn--ghost eco-btn--sm" onClick={recomecar}>Nova análise</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="analise">
      {!processando && (
        <form onSubmit={analisar} className="analise-form">
          <div
            className={`eco-dropzone analise-dropzone${arrastando ? " eco-dropzone--drag" : ""}`}
            role="button"
            tabIndex={0}
            aria-describedby="analise-dica"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragEnter={(e) => { e.preventDefault(); setArrastando(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => { e.preventDefault(); setArrastando(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setArrastando(false);
              adicionar(e.dataTransfer.files);
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0a7f4f" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
            <strong>Arraste as contas em PDF ou clique para escolher</strong>
            <span className="eco-pequeno eco-mudo" id="analise-dica">
              Mínimo de {MIN_CONTAS} contas · até {MAX_CONTAS} · 10 MB cada
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              hidden
              onChange={(e) => {
                adicionar(e.target.files);
                e.target.value = ""; // permite reenviar o mesmo arquivo depois de removê-lo
              }}
            />
          </div>

          {aviso && <p className="eco-alerta eco-alerta--info" role="status">{aviso}</p>}

          {arquivos.length > 0 && (
            <ul className="analise-arquivos">
              {arquivos.map(({ id, file }) => (
                <li key={id}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="1.6" aria-hidden="true">
                    <path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" />
                  </svg>
                  <span title={file.name}>{file.name}</span>
                  <small className="eco-num">{(file.size / 1024 / 1024).toFixed(1)} MB</small>
                  <button type="button" onClick={() => remover(id)} aria-label={`Remover ${file.name}`}>
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="eco-pequeno eco-mudo">
            <span aria-hidden="true">🔒 </span>O PDF é lido no seu navegador. Só o texto extraído é enviado para análise; o arquivo não é gravado.
            {logado ? " A análise será salva no seu histórico." : " Sem conta, nada é salvo."}
          </p>

          {erro && (
            <div className="eco-alerta eco-alerta--erro" role="alert">
              <strong>Não deu para analisar.</strong> {erro}
            </div>
          )}

          <div className="eco-acoes">
            <button type="submit" className="eco-btn eco-btn--primary" disabled={!suficiente}>
              {suficiente
                ? `Analisar ${arquivos.length} contas`
                : `Analisar contas (faltam ${MIN_CONTAS - arquivos.length})`}
            </button>
          </div>
        </form>
      )}

      {processando && (
        <div className="eco-card analise-progresso" role="status" aria-live="polite" aria-busy="true">
          <div className="analise-progresso-topo">
            <strong>{ETAPAS[etapa]}…</strong>
            <span className="eco-num">{Math.round(progresso)}%</span>
          </div>
          <div className="eco-progress" role="progressbar" aria-valuenow={Math.round(progresso)}
            aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da análise">
            <span style={{ "--valor": `${progresso}%` }} />
          </div>
          <ol className="analise-etapas">
            {ETAPAS.map((rotulo, i) => (
              <li key={rotulo} className={i < etapa ? "is-feita" : i === etapa ? "is-atual" : undefined}>
                <span className="analise-etapa-marca" aria-hidden="true">{i < etapa ? "✓" : ""}</span>
                {rotulo}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
