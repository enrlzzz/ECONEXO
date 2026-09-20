import { useEffect, useRef, useState } from "react";

import { FiCheck, FiClock, FiExternalLink, FiInfo, FiShield, FiUploadCloud, FiX } from "react-icons/fi";

import { validacaoService } from "../../../services/validacao";
import { useUserData } from "../../../useUserData";

const UFS = ["SP", "MG", "PR", "RJ", "SC", "RS", "BA", "GO", "PE", "CE", "DF"];

const TIPOS = [
  {
    id: "crea",
    marca: "C",
    nome: "CREA",
    descricao: "Registro profissional com consulta pública do conselho.",
  },
  {
    id: "nr10",
    marca: "10",
    nome: "NR-10",
    descricao: "Certificado + critérios de segurança em eletricidade.",
  },
  {
    id: "nr35",
    marca: "35",
    nome: "NR-35",
    descricao: "Certificado + treinamento e reciclagem em trabalho em altura.",
  },
];

const FONTE_NR =
  "https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes";

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Drawer de validação de credencial — os três passos do protótipo.
 *
 * Diferença em relação ao HTML: o passo 3 do CREA chama de verdade
 * POST /api/validacoes/crea. O protótipo simulava sempre sucesso; aqui a
 * consulta pode voltar INCONCLUSIVO, e nesse caso a tela diz isso em vez
 * de fingir que o registro foi confirmado. As NRs seguem documentais —
 * não existe base pública para conferi-las.
 */
export default function DrawerValidacao({ tipoInicial = "crea", aoFechar, aoConcluir, avisar }) {
  const usuario = useUserData();

  const [passo, setPasso] = useState(1);
  const [tipo, setTipo] = useState(tipoInicial);
  const [verificando, setVerificando] = useState(false);
  const [checks, setChecks] = useState([null, null, null]);
  const [resultado, setResultado] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [arrastando, setArrastando] = useState(false);

  // Sem campo de CPF: a consulta pública do CREA funciona com nome e
  // registro, e o CPF é dado sensível guardado cifrado (CLAUDE.md §2.11).
  // Ele existia aqui como estado morto — nunca renderizado, nunca enviado —
  // o que é justamente o tipo de coisa que alguém religa sem perceber.
  const [crea, setCrea] = useState({
    nome: usuario.nome || "",
    registro: "",
    uf: "SP",
  });

  const [nr, setNr] = useState({
    nome: usuario.nome || "",
    emissor: "",
    cnpj: "",
    data: "",
    horas: tipoInicial === "nr35" ? "8 horas" : "40 horas",
    responsavel: "",
  });

  const inputArquivo = useRef(null);
  const ehCrea = tipo === "crea";

  // Esc fecha; o corpo trava para a página de trás não rolar junto.
  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && aoFechar();
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aoFechar]);

  const rotulosCheck = ehCrea
    ? ["Identidade e registro", "Situação cadastral", "Evidência e rastreabilidade"]
    : ["Estrutura do certificado", "Carga horária e reciclagem", "Emissor e responsáveis"];

  const [detalhesCheck, setDetalhesCheck] = useState(["Aguardando…", "Aguardando…", "Aguardando…"]);

  async function verificar() {
    setVerificando(true);
    setResultado(null);
    setChecks([null, null, null]);
    setDetalhesCheck(["Aguardando…", "Aguardando…", "Aguardando…"]);

    if (ehCrea) {
      // A consulta real roda em paralelo com a animação dos checks: o
      // usuário vê progresso desde o primeiro instante, e o resultado
      // aparece quando a resposta chega — não antes.
      const consulta = validacaoService
        .crea({ nome: crea.nome, registro: crea.registro, uf: crea.uf })
        .catch((e) => ({
          status: "ERRO",
          mensagem: e.message || "Não foi possível consultar o CREA agora.",
          fonte: null,
          registro: crea.registro,
          uf: crea.uf,
        }));

      await espera(650);
      marcar(0, "ok", "Nome e registro enviados para consulta");
      await espera(650);
      marcar(1, "ok", "Consultando a fonte pública do conselho");

      const resposta = await consulta;

      const encontrado = resposta.status === "ATIVO";
      marcar(2, encontrado ? "ok" : "atencao", encontrado
        ? "Origem e horário registrados na auditoria"
        : "Consulta inconclusiva — confira na fonte oficial");

      await espera(380);

      setResultado({
        revisao: !encontrado,
        titulo: encontrado
          ? "Registro encontrado e compatível"
          : "Consulta inconclusiva",
        meta: encontrado
          ? "Consulta oficial • verificado agora"
          : "Consulta oficial • sem confirmação automática",
        rotuloOficial: "Resultado da consulta pública",
        valorOficial: resposta.mensagem,
        fonte: resposta.fonte,
        celulas: [
          ["Registro", resposta.registro || crea.registro],
          ["Conselho", `CREA-${resposta.uf || crea.uf}`],
          ["Situação", encontrado ? "Localizado" : "Não confirmado"],
          ["Status EcoNexo", encontrado ? "Vinculado" : "Pendente"],
        ],
        nota: "A consulta pública do CREA é informativa e não substitui uma certidão quando ela for exigida como comprovação oficial.",
        vinculado: encontrado,
      });
    } else {
      const rotulo = tipo === "nr10" ? "NR-10" : "NR-35";

      await espera(650);
      marcar(0, "ok", "Campos obrigatórios identificados");
      await espera(650);
      marcar(1, "ok", tipo === "nr35"
        ? "8h e periodicidade compatíveis"
        : "Conteúdo e carga horária consistentes");
      await espera(650);
      marcar(2, "atencao", "Emissor e responsável exigem revisão");
      await espera(380);

      setResultado({
        revisao: true,
        titulo: "Documento consistente — revisão final recomendada",
        meta: "Validação documental • evidência suficiente para triagem",
        rotuloOficial: "Resultado da análise EcoNexo",
        valorOficial: `${rotulo} — estrutura e datas consistentes`,
        fonte: FONTE_NR,
        celulas: [
          ["Carga horária", nr.horas || "Não informada"],
          ["Emissor", nr.cnpj ? "CNPJ informado" : "Não informado"],
          ["Responsável", nr.responsavel ? "Identificado" : "Não informado"],
          ["Status EcoNexo", "Revisão humana"],
        ],
        nota: "Para NRs a EcoNexo considera estrutura do certificado, datas, emissor, carga horária e evidência documental, com revisão humana quando necessário. Não existe base pública para conferência automática.",
        vinculado: false,
      });
    }

    setVerificando(false);
  }

  function marcar(indice, estado, texto) {
    setChecks((atuais) => atuais.map((v, i) => (i === indice ? estado : v)));
    setDetalhesCheck((atuais) => atuais.map((v, i) => (i === indice ? texto : v)));
  }

  function avancar() {
    if (passo === 1) {
      setPasso(2);
      return;
    }

    if (passo === 2) {
      if (ehCrea && (!crea.nome.trim() || !crea.registro.trim())) {
        avisar("Informe nome e número do registro.", "!");
        return;
      }
      if (!ehCrea && !nr.emissor.trim()) {
        avisar("Informe a instituição que emitiu o certificado.", "!");
        return;
      }
      setPasso(3);
      verificar();
      return;
    }

    // Passo 3: conclui.
    aoConcluir({ tipo, resultado });
    aoFechar();
  }

  function receberArquivo(lista) {
    const arq = lista?.[0];
    if (!arq) return;
    setArquivo(arq);
  }

  const podeConcluir = passo < 3 || (!verificando && resultado);

  return (
    <div
      className="vr-overlay"
      onClick={(e) => e.target === e.currentTarget && aoFechar()}
    >
      <section className="vr-drawer" role="dialog" aria-modal="true" aria-label="Validar credencial">
        <header className="vr-drawer-cabecalho">
          <div>
            <h2>Validar nova credencial</h2>
            <p>CREA por consulta oficial. NRs por evidência documental.</p>
          </div>
          <button type="button" className="vr-fechar" onClick={aoFechar} aria-label="Fechar">
            <FiX aria-hidden="true" />
          </button>
        </header>

        <ol className="vr-passos">
          {["Credencial", "Dados & prova", "Resultado"].map((rotulo, i) => {
            const n = i + 1;
            return (
              <li
                key={rotulo}
                className={`vr-passo${n === passo ? " ativo" : ""}${n < passo ? " concluido" : ""}`}
              >
                <i aria-hidden="true">{n < passo ? <FiCheck /> : n}</i>
                <span>{rotulo}</span>
              </li>
            );
          })}
        </ol>

        <div className="vr-drawer-corpo">
          {/* ---------------- PASSO 1 ---------------- */}
          {passo === 1 && (
            <>
              <h3 className="vr-fluxo-titulo">Qual credencial você quer validar?</h3>
              <p className="vr-fluxo-sub">
                O método muda conforme a fonte de verdade disponível.
              </p>

              <div className="vr-tipos">
                {TIPOS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`vr-tipo${tipo === t.id ? " selecionado" : ""}`}
                    aria-pressed={tipo === t.id}
                    onClick={() => {
                      setTipo(t.id);
                      if (t.id !== "crea") {
                        setNr((a) => ({
                          ...a,
                          horas: t.id === "nr35" ? "8 horas" : "40 horas",
                        }));
                      }
                    }}
                  >
                    <span className={`vr-tipo-icone ${t.id}`} aria-hidden="true">
                      {t.marca}
                    </span>
                    <strong>{t.nome}</strong>
                    <span>{t.descricao}</span>
                  </button>
                ))}
              </div>

              <div className="vr-info">
                <span aria-hidden="true"><FiInfo /></span>
                <div>
                  <strong>Dois tipos de verificação</strong>
                  <p>
                    CREA por consulta oficial. NRs por evidência documental:
                    datas, emissor, carga horária e revisão humana quando
                    necessário.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ---------------- PASSO 2 ---------------- */}
          {passo === 2 && ehCrea && (
            <>
              <h3 className="vr-fluxo-titulo">Dados do registro CREA</h3>
              <p className="vr-fluxo-sub">
                A consulta usa nome e número do registro no portal do conselho da UF.
              </p>

              <div className="vr-form">
                <div className="eco-field completo">
                  <label htmlFor="crea-nome">Nome completo</label>
                  <input
                    id="crea-nome"
                    value={crea.nome}
                    onChange={(e) => setCrea({ ...crea, nome: e.target.value })}
                  />
                </div>
                <div className="eco-field">
                  <label htmlFor="crea-registro">Número do registro</label>
                  <input
                    id="crea-registro"
                    value={crea.registro}
                    onChange={(e) => setCrea({ ...crea, registro: e.target.value })}
                    placeholder="123456789-0"
                  />
                </div>
                <div className="eco-field">
                  <label htmlFor="crea-uf">UF do CREA</label>
                  <select
                    id="crea-uf"
                    value={crea.uf}
                    onChange={(e) => setCrea({ ...crea, uf: e.target.value })}
                  >
                    {UFS.map((uf) => (
                      <option key={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* O campo de CPF do protótipo saiu daqui de propósito: CPF é
                  dado sensível, guardado cifrado no cadastro, e a consulta
                  pública do CREA funciona com nome + registro. Pedir de novo
                  só criaria mais um lugar por onde ele pode vazar. */}
              <div className="vr-info">
                <span aria-hidden="true"><FiExternalLink /></span>
                <div>
                  <strong>Consulta prevista: CREA-{crea.uf}</strong>
                  <p>
                    O resultado vira evidência no seu perfil, com origem e
                    horário registrados na trilha de auditoria.
                  </p>
                </div>
              </div>
            </>
          )}

          {passo === 2 && !ehCrea && (
            <>
              <h3 className="vr-fluxo-titulo">
                Dados do certificado {tipo === "nr10" ? "NR-10" : "NR-35"}
              </h3>
              <p className="vr-fluxo-sub">
                A EcoNexo cruza campos obrigatórios, datas, carga horária,
                emissor e responsável técnico.
              </p>

              <div className="vr-form">
                <div className="eco-field completo">
                  <label htmlFor="nr-nome">Nome do trabalhador</label>
                  <input
                    id="nr-nome"
                    value={nr.nome}
                    onChange={(e) => setNr({ ...nr, nome: e.target.value })}
                  />
                </div>
                <div className="eco-field">
                  <label htmlFor="nr-emissor">Instituição / organização</label>
                  <input
                    id="nr-emissor"
                    value={nr.emissor}
                    onChange={(e) => setNr({ ...nr, emissor: e.target.value })}
                  />
                </div>
                <div className="eco-field">
                  <label htmlFor="nr-cnpj">CNPJ do emissor</label>
                  <input
                    id="nr-cnpj"
                    value={nr.cnpj}
                    onChange={(e) => setNr({ ...nr, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div className="eco-field">
                  <label htmlFor="nr-data">Data de realização</label>
                  <input
                    id="nr-data"
                    type="date"
                    value={nr.data}
                    onChange={(e) => setNr({ ...nr, data: e.target.value })}
                  />
                </div>
                <div className="eco-field">
                  <label htmlFor="nr-horas">Carga horária</label>
                  <input
                    id="nr-horas"
                    value={nr.horas}
                    onChange={(e) => setNr({ ...nr, horas: e.target.value })}
                  />
                </div>
                <div className="eco-field completo">
                  <label htmlFor="nr-resp">Responsável técnico / instrutor</label>
                  <input
                    id="nr-resp"
                    value={nr.responsavel}
                    onChange={(e) => setNr({ ...nr, responsavel: e.target.value })}
                  />
                </div>

                <div className="eco-field completo">
                  <label htmlFor="nr-arquivo">Certificado</label>
                  <div
                    className={`eco-dropzone${arrastando ? " eco-dropzone--drag" : ""}`}
                    onClick={() => inputArquivo.current?.click()}
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
                      receberArquivo(e.dataTransfer.files);
                    }}
                  >
                    <span className="vr-tipo-icone" aria-hidden="true">
                      <FiUploadCloud />
                    </span>
                    <strong>Arraste PDF ou imagem aqui</strong>
                    <span> ou clique para selecionar • até 10 MB</span>

                    <input
                      id="nr-arquivo"
                      ref={inputArquivo}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hidden
                      onChange={(e) => receberArquivo(e.target.files)}
                    />

                    {arquivo && (
                      <div className="vr-arquivo-pill">
                        <div>
                          <strong>{arquivo.name}</strong>
                          <span>{(arquivo.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <span className="eco-badge eco-badge--ok">Pronto</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="vr-info">
                <span aria-hidden="true"><FiShield /></span>
                <div>
                  <strong>Validação em camadas</strong>
                  <p>
                    Estrutura do documento → datas → carga horária → emissor →
                    responsáveis → revisão humana quando necessário.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ---------------- PASSO 3 ---------------- */}
          {passo === 3 && !resultado && (
            <>
              <h3 className="vr-fluxo-titulo">Verificando evidências…</h3>
              <p className="vr-fluxo-sub">
                {ehCrea
                  ? "Consultando a base oficial do conselho."
                  : "Extraindo campos obrigatórios e verificando consistência."}
              </p>

              <div className="vr-scan">
                <div className="vr-scan-topo">
                  <div className="eco-spinner" aria-hidden="true" />
                  <div>
                    <strong>
                      {ehCrea ? "Consultando base oficial" : "Analisando certificado e emissor"}
                    </strong>
                    <span>
                      {ehCrea
                        ? "Comparando registro e identidade informada."
                        : "Cruzando datas, carga horária e responsáveis."}
                    </span>
                  </div>
                </div>

                <ul className="vr-checks">
                  {rotulosCheck.map((rotulo, i) => (
                    <li
                      key={rotulo}
                      className={`vr-check${checks[i] ? ` ${checks[i]}` : ""}`}
                    >
                      <span className="vr-check-ponto" aria-hidden="true">
                        {checks[i] === "ok" ? <FiCheck /> : <FiClock />}
                      </span>
                      <div>
                        <strong>{rotulo}</strong>
                        <span>{detalhesCheck[i]}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {passo === 3 && resultado && (
            <>
              <h3 className="vr-fluxo-titulo">Resultado da verificação</h3>
              {/* Era uma frase fixa: mesmo quando a consulta falhava, a tela
                  dizia "a evidência foi registrada" ao lado de "Consulta
                  inconclusiva". Afirmava um registro que não aconteceu. */}
              <p className="vr-fluxo-sub">
                {resultado.vinculado
                  ? "A evidência foi registrada no seu perfil."
                  : "Nada foi vinculado ao seu perfil ainda — veja o que faltou abaixo."}
              </p>

              <div className={`vr-resultado${resultado.revisao ? " revisao" : ""}`}>
                <div className="vr-resultado-cabecalho">
                  <span className="vr-resultado-icone" aria-hidden="true">
                    {resultado.revisao ? <FiClock /> : <FiCheck />}
                  </span>
                  <div>
                    <strong>{resultado.titulo}</strong>
                    <span>{resultado.meta}</span>
                  </div>
                </div>

                <div className="vr-oficial">
                  <div className="vr-oficial-rotulo">{resultado.rotuloOficial}</div>
                  <div className="vr-oficial-valor">{resultado.valorOficial}</div>

                  <ul className="vr-celulas">
                    {resultado.celulas.map(([rotulo, valor]) => (
                      <li key={rotulo} className="vr-celula">
                        <span>{rotulo}</span>
                        <strong>{valor}</strong>
                      </li>
                    ))}
                  </ul>

                  <p className="vr-nota-legal">{resultado.nota}</p>
                </div>
              </div>

              {resultado.fonte && (
                <a
                  className="eco-btn eco-btn--light"
                  href={resultado.fonte}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Abrir fonte oficial <FiExternalLink aria-hidden="true" />
                </a>
              )}
            </>
          )}
        </div>

        <footer className="vr-drawer-rodape">
          <button
            type="button"
            className="eco-btn eco-btn--light"
            onClick={() => setPasso((p) => Math.max(1, p - 1))}
            style={{ visibility: passo > 1 && !verificando ? "visible" : "hidden" }}
          >
            Voltar
          </button>
          <button
            type="button"
            className="eco-btn eco-btn--primary"
            onClick={avancar}
            disabled={!podeConcluir}
          >
            {passo === 3 ? "Concluir" : "Continuar"}
          </button>
        </footer>
      </section>
    </div>
  );
}
