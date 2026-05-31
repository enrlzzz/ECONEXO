// Camada de persistência dos posts (timeline) no localStorage.
// Backend Spring Boot ainda não expõe /api/posts — esse arquivo
// já está modelado para ser plugado em REST quando os endpoints
// existirem (basta trocar leituras/escritas por api.get/api.post).

import { SEED_POSTS } from "./mockSeeds";

const KEY = "econexo.posts.v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED_POSTS));
      return SEED_POSTS.slice();
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_POSTS.slice();
  } catch {
    return SEED_POSTS.slice();
  }
}

function save(posts) {
  localStorage.setItem(KEY, JSON.stringify(posts));
}

export const postsService = {
  listar() {
    return load();
  },

  criar({ autor, texto, tags = [], foto = null }) {
    const posts = load();
    const novo = {
      id: "p_" + Date.now(),
      autor,
      seguindo: false,
      tempo: "agora",
      texto,
      foto,
      tags,
      likes: 0,
      curtido: false,
      comentarios: [],
    };
    const lista = [novo, ...posts];
    save(lista);
    return novo;
  },

  alternarCurtida(postId) {
    const posts = load().map((p) =>
      p.id === postId
        ? { ...p, curtido: !p.curtido, likes: p.likes + (p.curtido ? -1 : 1) }
        : p,
    );
    save(posts);
    return posts;
  },

  alternarSeguir(postId) {
    const posts = load().map((p) =>
      p.id === postId ? { ...p, seguindo: !p.seguindo } : p,
    );
    save(posts);
    return posts;
  },

  comentar(postId, comentario) {
    const posts = load().map((p) =>
      p.id === postId
        ? {
            ...p,
            comentarios: [
              ...p.comentarios,
              { id: "c_" + Date.now(), tempo: "agora", ...comentario },
            ],
          }
        : p,
    );
    save(posts);
    return posts;
  },

  resetar() {
    localStorage.removeItem(KEY);
  },
};
