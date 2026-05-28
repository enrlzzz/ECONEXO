import { api } from "./api";

export const usuariosService = {
  criar: (usuario) => api.post("/usuarios", usuario),
  listar: () => api.get("/usuarios"),
  buscarPorId: (id) => api.get(`/usuarios/${id}`),
  atualizar: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
  remover: (id) => api.delete(`/usuarios/${id}`),
  login: (email, senha) =>
    api.post(`/usuarios/login`, undefined, { params: { email, senha } }),
};
