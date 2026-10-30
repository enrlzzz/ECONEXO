import "./index.css";

import { useEffect, useState } from "react";
import { IconPhoto, IconPlus, IconX } from "@tabler/icons-react";

const CHAVE = "portfolio";
const FORM_VAZIO = { titulo: "", descricao: "", foto: "" };

// A foto fica no navegador (localStorage, ~5 MB no total): acima disso o
// salvamento falharia em silêncio e o projeto sumiria ao recarregar.
const FOTO_MAX_BYTES = 1.5 * 1024 * 1024;

/**
 * Portfólio.
 *
 * Ainda não existe endpoint de portfólio no backend: os projetos ficam só
 * neste navegador. Por isso nada aqui conta como "verificado" — a tela diz
 * isso em vez de mostrar uma "taxa de verificação" sempre zerada.
 */
export default function PortfolioInterface() {
  // Lazy init em vez de setState num efeito (evita render em cascata).
  const [projetos, setProjetos] = useState(() => {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
      return Array.isArray(dados) ? dados : [];
    } catch {
      return []; // JSON corrompido não derruba a tela
    }
  });
  const [dialogo, setDialogo] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");
  const [erroSalvar, setErroSalvar] = useState("");

  /** Grava a lista; se não couber no navegador, não troca o que está na tela. */
  function salvar(lista) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
      setProjetos(lista);
      setErroSalvar("");
      return true;
    } catch {
      setErroSalvar("Não coube no armazenamento do navegador. Remova um projeto ou use uma foto menor.");
      return false;
    }
  }

  useEffect(() => {
    if (!dialogo) return undefined;
    const aoTeclar = (e) => e.key === "Escape" && setDialogo(false);
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [dialogo]);

  function aoEscolherFoto(e) {
    const arquivo = e.target.files?.[0];
    setErroForm("");
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      setErroForm("Escolha um arquivo de imagem (JPG, PNG ou WebP).");
      return;
    }
    if (arquivo.size > FOTO_MAX_BYTES) {
      setErroForm("A foto passa de 1,5 MB. Escolha uma menor.");
      return;
    }
    const leitor = new FileReader();
    leitor.onloadend = () => setForm((f) => ({ ...f, foto: leitor.result }));
    leitor.readAsDataURL(arquivo);
  }

  function adicionar(e) {
    e.preventDefault();
    // Date.now() e não "tamanho + 1": depois de excluir um item, o
    // tamanho+1 repetia um id existente.
    if (!salvar([{ id: Date.now(), ...form }, ...projetos])) return;
    setForm(FORM_VAZIO);
    setDialogo(false);
  }

  function remover(projeto) {
    if (!window.confirm(`Remover "${projeto.titulo}" do portfólio?`)) return;
    salvar(projetos.filter((p) => p.id !== projeto.id));
  }

  const abrir = () => {
    setErroForm("");
    setDialogo(true);
  };

  return (
    <div className="pg">
      <header className="pg-cabeca">
        <div>
          <h1 className="pg-titulo">Portfólio</h1>
          <p className="pg-sub">Mostre as instalações que você já fez. Quem te procura vê isso primeiro.</p>
        </div>
        {projetos.length > 0 && (
          <button type="button" className="eco-btn eco-btn--primary" onClick={abrir}>
            <IconPlus size={18} stroke={2} aria-hidden="true" />
            Adicionar projeto
          </button>
        )}
      </header>

      <p className="eco-alerta eco-alerta--info">
        Por enquanto o portfólio fica salvo só neste navegador. Em outro aparelho ele aparece vazio.
      </p>

      {erroSalvar && <p className="eco-alerta eco-alerta--erro" role="alert">{erroSalvar}</p>}

      {projetos.length === 0 ? (
        <div className="pg-vazio">
          <IconPhoto size={36} stroke={1.4} aria-hidden="true" className="port-vazio-icone" />
          <h2>Seu portfólio está vazio</h2>
          <p>Adicione uma instalação com foto e descrição. Projetos com foto passam mais confiança.</p>
          <button type="button" className="eco-btn eco-btn--primary" onClick={abrir}>
            <IconPlus size={18} stroke={2} aria-hidden="true" />
            Adicionar primeiro projeto
          </button>
        </div>
      ) : (
        <ul className="port-grade">
          {projetos.map((p) => (
            <li key={p.id} className="port-card">
              {p.foto ? (
                <img src={p.foto} alt={`Foto do projeto ${p.titulo}`} />
              ) : (
                <div className="port-sem-foto" aria-hidden="true">
                  <IconPhoto size={28} stroke={1.4} />
                </div>
              )}
              <div className="port-card-corpo">
                <h2>{p.titulo}</h2>
                {p.descricao && <p>{p.descricao}</p>}
                <button type="button" className="eco-btn eco-btn--texto port-remover" onClick={() => remover(p)}>
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {dialogo && (
        <div className="pg-dialogo-fundo" onClick={(e) => e.target === e.currentTarget && setDialogo(false)}>
          <div className="pg-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-portfolio">
            <div className="pg-dialogo-cabeca">
              <div>
                <h2 id="titulo-portfolio">Adicionar ao portfólio</h2>
                <p>Uma instalação que você já concluiu.</p>
              </div>
              <button type="button" className="pg-fechar" onClick={() => setDialogo(false)} aria-label="Fechar">
                <IconX size={18} aria-hidden="true" />
              </button>
            </div>

            <form className="pg-form" onSubmit={adicionar}>
              <div className="eco-field pg-form-inteiro">
                <label htmlFor="port-titulo">Título</label>
                <input id="port-titulo" value={form.titulo} autoFocus required
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex.: Residencial 10 kWp em Votorantim" />
              </div>

              <div className="eco-field pg-form-inteiro">
                <label htmlFor="port-descricao">Descrição</label>
                <textarea id="port-descricao" rows={3} value={form.descricao} required
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  placeholder="Potência, equipamentos, tipo de telhado, prazo…" />
              </div>

              <div className="eco-field pg-form-inteiro">
                <label htmlFor="port-foto">Foto (opcional, até 1,5 MB)</label>
                <input id="port-foto" type="file" accept="image/*" onChange={aoEscolherFoto} className="port-arquivo" />
                {form.foto && <img src={form.foto} alt="Pré-visualização da foto" className="port-previa" />}
              </div>

              {erroForm && <p className="eco-alerta eco-alerta--erro pg-form-inteiro" role="alert">{erroForm}</p>}

              <div className="pg-dialogo-acoes">
                <button type="button" className="eco-btn eco-btn--ghost" onClick={() => setDialogo(false)}>
                  Cancelar
                </button>
                <button type="submit" className="eco-btn eco-btn--primary">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
