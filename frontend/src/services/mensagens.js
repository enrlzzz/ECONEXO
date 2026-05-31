// Camada de persistência das conversas (DM) no localStorage.
// Backend Spring Boot ainda não expõe /api/mensagens — esse arquivo
// já está modelado para ser plugado em REST quando os endpoints existirem.

import { SEED_CONVERSAS } from "./mockSeeds";

const KEY = "econexo.conversas.v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED_CONVERSAS));
      return SEED_CONVERSAS.slice();
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_CONVERSAS.slice();
  } catch {
    return SEED_CONVERSAS.slice();
  }
}

function save(convos) {
  localStorage.setItem(KEY, JSON.stringify(convos));
}

function nowHHmm() {
  const d = new Date();
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

export const mensagensService = {
  listar() {
    return load();
  },

  encontrarOuCriarConversaCom(usuario) {
    const convos = load();
    const existente = convos.find((c) => c.participanteId === usuario.id);
    if (existente) return existente;
    const nova = {
      id: "conv_" + usuario.id,
      participanteId: usuario.id,
      nome: usuario.nome,
      initials: usuario.initials,
      color: usuario.color,
      role: usuario.role || "",
      regiao: usuario.regiao || "",
      verificado: !!usuario.verificado,
      online: false,
      ultima: "Conversa iniciada",
      tempo: "agora",
      naoLidas: 0,
      mensagens: [],
    };
    save([nova, ...convos]);
    return nova;
  },

  marcarComoLida(conversaId) {
    const convos = load().map((c) =>
      c.id === conversaId ? { ...c, naoLidas: 0 } : c,
    );
    save(convos);
    return convos;
  },

  enviar(conversaId, texto) {
    if (!texto || !texto.trim()) return load();
    const tempo = nowHHmm();
    const convos = load().map((c) => {
      if (c.id !== conversaId) return c;
      const msg = {
        id: "m_" + Date.now(),
        de: "eu",
        tipo: "texto",
        tempo,
        lido: false,
        texto: texto.trim(),
      };
      return {
        ...c,
        mensagens: [...c.mensagens, msg],
        ultima: texto.trim(),
        tempo,
      };
    });
    save(convos);
    return convos;
  },

  receberRespostaSimulada(conversaId) {
    const respostas = [
      "Show, anotado!",
      "Combinado, qualquer coisa chama por aqui 👍",
      "Perfeito, te mando os detalhes mais tarde.",
      "Bora alinhar amanhã então.",
    ];
    const tempo = nowHHmm();
    const convos = load().map((c) => {
      if (c.id !== conversaId) return c;
      const texto = respostas[(c.mensagens.length + 1) % respostas.length];
      const msg = {
        id: "m_" + Date.now(),
        de: "outro",
        tipo: "texto",
        tempo,
        texto,
      };
      return {
        ...c,
        mensagens: [
          ...c.mensagens.map((m) =>
            m.de === "eu" ? { ...m, lido: true } : m,
          ),
          msg,
        ],
        ultima: texto,
        tempo,
      };
    });
    save(convos);
    return convos;
  },

  resetar() {
    localStorage.removeItem(KEY);
  },
};
