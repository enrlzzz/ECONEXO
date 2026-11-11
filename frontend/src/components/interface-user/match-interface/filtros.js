export const COMPLEMENTARES = {
  PROJETISTA: ["INSTALADOR", "TECNICO"],
  INSTALADOR: ["PROJETISTA"],
  TECNICO: ["PROJETISTA"],
};

export function filtrarMatch(lista, usuario, filtros) {
  const tipos = COMPLEMENTARES[usuario?.tipoProfissional] || [];
  const cidade = filtros.cidade.trim().toLocaleLowerCase("pt-BR");
  return lista.filter((p) => String(p.idUsuario) !== String(usuario.idUsuario)
    && tipos.includes(p.tipoProfissional)
    && (!filtros.tipo || p.tipoProfissional === filtros.tipo)
    && (!filtros.estado || (p.estado || "").toUpperCase() === filtros.estado.toUpperCase())
    && (!cidade || (p.cidade || "").toLocaleLowerCase("pt-BR").includes(cidade)));
}
