export async function localizarParticipante(id, buscarPorId) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Profissional inválido.");
  const pessoa = await buscarPorId(id);
  if (!pessoa || Number(pessoa.idUsuario) !== id) throw new Error("Profissional não encontrado.");
  return pessoa;
}
