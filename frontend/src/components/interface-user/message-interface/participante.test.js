import { test } from "node:test";
import assert from "node:assert/strict";
import { localizarParticipante } from "./participante.js";

test("abre diretamente participante fora dos primeiros 50 resultados", async () => {
  let consultado;
  const pessoa = await localizarParticipante(73, async (id) => { consultado = id; return { idUsuario: id, nome: "Profissional" }; });
  assert.equal(consultado, 73);
  assert.equal(pessoa.idUsuario, 73);
});

test("rejeita identificador inválido ou resposta divergente", async () => {
  await assert.rejects(() => localizarParticipante(-1, async () => null));
  await assert.rejects(() => localizarParticipante(73, async () => ({ idUsuario: 74 })));
});
