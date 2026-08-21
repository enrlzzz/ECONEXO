import { api } from "./api";

export const usuariosService = {
  criar: (usuario) => api.post("/usuarios", usuario),
  listar: () => api.get("/usuarios"),
  buscarPorId: (id) => api.get(`/usuarios/${id}`),
  atualizar: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
  remover: (id) => api.delete(`/usuarios/${id}`),

  /**
   * Devolve { token, expiraEmSegundos, usuario }.
   *
   * As credenciais vão no CORPO. Antes iam como query string
   * (/usuarios/login?email=..&senha=..), o que gravava a senha em texto puro
   * no log do servidor, no do proxy e no histórico do navegador.
   */
  login: (email, senha) => api.post("/auth/login", { email, senha }),
};
