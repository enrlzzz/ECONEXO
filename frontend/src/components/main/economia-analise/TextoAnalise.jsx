/**
 * Mostra o texto da IA com formatação leve, SEM dangerouslySetInnerHTML.
 *
 * A resposta do modelo é texto não confiável: se fosse injetada como HTML,
 * uma conta de luz adulterada (prompt injection) poderia gerar <script> ou
 * <img onerror>. Aqui o texto vira só elementos React: títulos "## ", listas
 * "- " e **negrito**; qualquer outra coisa é texto puro, que o React escapa.
 */

function comNegrito(texto) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trecho, i) =>
    trecho.startsWith("**") && trecho.endsWith("**") && trecho.length > 4 ? (
      <strong key={i}>{trecho.slice(2, -2)}</strong>
    ) : (
      trecho
    ),
  );
}

export default function TextoAnalise({ texto }) {
  const blocos = [];
  let itens = null;

  const fecharLista = () => {
    if (itens) {
      blocos.push({ tipo: "ul", itens });
      itens = null;
    }
  };

  for (const bruta of String(texto || "").split(/\r?\n/)) {
    const linha = bruta.trim();

    if (!linha) {
      fecharLista();
    } else if (/^#{1,4}\s+/.test(linha)) {
      fecharLista();
      blocos.push({ tipo: "h4", texto: linha.replace(/^#{1,4}\s+/, "") });
    } else if (/^[-*•]\s+/.test(linha)) {
      itens = itens || [];
      itens.push(linha.replace(/^[-*•]\s+/, ""));
    } else {
      fecharLista();
      blocos.push({ tipo: "p", texto: linha });
    }
  }
  fecharLista();

  return (
    <div className="economia-texto">
      {blocos.map((b, i) => {
        if (b.tipo === "h4") return <h4 key={i}>{comNegrito(b.texto)}</h4>;
        if (b.tipo === "ul")
          return (
            <ul key={i}>
              {b.itens.map((item, j) => (
                <li key={j}>{comNegrito(item)}</li>
              ))}
            </ul>
          );
        return <p key={i}>{comNegrito(b.texto)}</p>;
      })}
    </div>
  );
}
