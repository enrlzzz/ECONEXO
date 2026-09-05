import { useCallback, useEffect, useState } from "react";
import { getUser, isLoggedIn } from "./userSession";

/**
 * Assina as mudanças de sessão.
 *
 * "storage" só dispara em OUTRAS abas; por isso userSession também emite o
 * evento próprio "econexo:sessao". Sem ele, salvar o perfil ou sair não
 * atualizava o header da mesma aba até o F5.
 */
function useAssinaturaSessao(ler) {
  const [valor, setValor] = useState(ler);

  const atualizar = useCallback(() => setValor(ler()), [ler]);

  useEffect(() => {
    window.addEventListener("storage", atualizar);
    window.addEventListener("econexo:sessao", atualizar);
    return () => {
      window.removeEventListener("storage", atualizar);
      window.removeEventListener("econexo:sessao", atualizar);
    };
  }, [atualizar]);

  return valor;
}

export function useUserData() {
  return useAssinaturaSessao(readSafe);
}

/**
 * "Existe sessão agora?" — reativo.
 *
 * isLoggedIn() lido direto no corpo do componente não re-renderiza quando a
 * pessoa sai: o menu continuava mostrando o perfil de quem já tinha deslogado.
 */
export function useLogado() {
  return useAssinaturaSessao(isLoggedIn);
}

function readSafe() {
  const u = getUser();
  return (
    u || {
      id: "",
      nome: "",
      email: "",
      cidade: "",
      estado: "",
      role: "",
      initials: "",
      color: "#2A26C7",
    }
  );
}
