import { useCallback, useState } from "react";

/**
 * Fila de toasts das telas de validação e reputação.
 *
 * Vive em arquivo próprio porque o Fast Refresh do Vite só funciona em
 * módulos que exportam apenas componentes — um hook exportado junto dos
 * componentes em Compartilhado.jsx derrubava o hot reload da tela inteira.
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const avisar = useCallback((mensagem, icone = "✓") => {
    const id = Date.now() + Math.random();
    setToasts((atuais) => [...atuais, { id, mensagem, icone }]);
    setTimeout(
      () => setToasts((atuais) => atuais.filter((t) => t.id !== id)),
      2600,
    );
  }, []);

  return { toasts, avisar };
}
