import { useEffect, useState } from "react";

import { notificacoesService } from "./services/notificacoes";
import { isLoggedIn } from "./userSession";

const INTERVALO_MS = 60_000;

/** Telas avisam por aqui que as notificações mudaram (ex.: marcou como lida). */
export const EVENTO_NOTIFICACOES = "econexo:notificacoes";

/**
 * Quantidade de notificações não lidas, para o sino do cabeçalho.
 *
 * Consulta de minuto em minuto e quando a aba volta a ficar visível. Aba em
 * segundo plano não consulta — não há por que gastar o servidor (e o plano
 * gratuito dele) para um contador que ninguém está olhando.
 *
 * Falha em silêncio: o sino é conveniência, não pode quebrar a tela.
 */
export function useNotificacoesNaoLidas() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isLoggedIn()) return undefined;

    let vivo = true;

    async function atualizar() {
      if (document.hidden) return;
      try {
        const resposta = await notificacoesService.naoLidas();
        if (vivo) setTotal(Number(resposta?.total) || 0);
      } catch {
        // mantém o último valor conhecido
      }
    }

    atualizar();
    const timer = setInterval(atualizar, INTERVALO_MS);
    window.addEventListener(EVENTO_NOTIFICACOES, atualizar);
    document.addEventListener("visibilitychange", atualizar);

    return () => {
      vivo = false;
      clearInterval(timer);
      window.removeEventListener(EVENTO_NOTIFICACOES, atualizar);
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, []);

  return total;
}
