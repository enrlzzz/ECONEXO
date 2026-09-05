// Formatações compartilhadas entre timeline, mensagens e busca.

import { getInitials, colorFor } from "./userSession";

/**
 * Monta avatar (iniciais + cor) a partir do que a API devolve.
 *
 * O backend não guarda foto nem cor de perfil — e não deveria: cor é decisão
 * de apresentação. Derivamos do id para que a mesma pessoa tenha sempre a
 * mesma cor em qualquer tela e em qualquer navegador.
 */
export function avatarDe(profissional) {
  const id = String(profissional?.idUsuario ?? "");
  const nome = profissional?.nome || "";
  return {
    id,
    nome,
    initials: getInitials(nome),
    color: colorFor(id || nome),
  };
}

/** "Campinas · SP", ou "" se a pessoa não informou. */
export function regiaoDe(profissional) {
  return [profissional?.cidade, profissional?.estado].filter(Boolean).join(" · ");
}

const ROTULO_TIPO = {
  INSTALADOR: "Instalador",
  PROJETISTA: "Projetista",
  TECNICO: "Técnico",
};

/**
 * Rótulo do tipo profissional.
 *
 * Devolve "" — e não um cargo inventado — quando a pessoa não preencheu.
 * A interface mostra o espaço vazio; não é papel do front supor profissão.
 */
export function tipoProfissionalLabel(tipo) {
  return ROTULO_TIPO[tipo] || "";
}

/** "agora", "há 5 min", "há 3 h", "há 2 d" ou a data cheia. */
export function tempoRelativo(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";

  const segundos = Math.floor((Date.now() - data.getTime()) / 1000);
  if (segundos < 60) return "agora";

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias < 7) return `há ${dias} d`;

  return data.toLocaleDateString("pt-BR");
}

/** "14:32" — usado nas bolhas de mensagem. */
export function horaDe(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
