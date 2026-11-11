import { test } from "node:test";
import assert from "node:assert/strict";
import { filtrarMatch } from "./filtros.js";

const lista = [
  { idUsuario: 1, tipoProfissional: "PROJETISTA", cidade: "Sorocaba", estado: "SP" },
  { idUsuario: 2, tipoProfissional: "INSTALADOR", cidade: "Sorocaba", estado: "SP" },
  { idUsuario: 3, tipoProfissional: "TECNICO", cidade: "Campinas", estado: "SP" },
  { idUsuario: 4, tipoProfissional: null },
];

test("exibe somente papéis complementares, sem o próprio usuário", () => {
  assert.deepEqual(filtrarMatch(lista, lista[0], { cidade: "", estado: "", tipo: "" }).map((p) => p.idUsuario), [2, 3]);
  assert.deepEqual(filtrarMatch(lista, lista[1], { cidade: "", estado: "", tipo: "" }).map((p) => p.idUsuario), [1]);
  assert.deepEqual(filtrarMatch(lista, lista[3], { cidade: "", estado: "", tipo: "" }), []);
});

test("filtra dados reais e ignora maiúsculas na cidade e UF", () => {
  assert.deepEqual(filtrarMatch(lista, lista[0], { cidade: "sorocaba", estado: "sp", tipo: "INSTALADOR" }).map((p) => p.idUsuario), [2]);
  assert.deepEqual(filtrarMatch(lista, lista[0], { cidade: "campinas", estado: "SP", tipo: "INSTALADOR" }), []);
});
