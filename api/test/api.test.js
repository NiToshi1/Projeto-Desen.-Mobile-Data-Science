// Testes de integração da API (node --test). Usam uma cópia temporária
// de dados/, então os arquivos de seed nunca são alterados.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

let servidor;
let base;
let dir;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "api-teste-"));
  fs.cpSync(path.join(__dirname, "..", "dados"), dir, { recursive: true });
  process.env.DADOS_DIR = dir;
  const { criarApp } = require("../server");
  await new Promise((ok) => {
    servidor = criarApp().listen(0, ok);
  });
  base = `http://localhost:${servidor.address().port}`;
});

after(() => {
  servidor.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

async function chamar(metodo, rota, corpo) {
  const r = await fetch(base + rota, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: corpo === undefined ? undefined : typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });
  return { status: r.status, corpo: await r.json().catch(() => null) };
}

test("GET / responde que a API está no ar", async () => {
  const r = await chamar("GET", "/");
  assert.equal(r.status, 200);
  assert.equal(r.corpo.status, "ok");
});

test("CRUD completo de ocorrências", async () => {
  const nova = { data_ocorrencia: "2026-11-01 10:00", tipo_violencia: "Moral", local: "Trabalho", descricao: "Humilhação pública.", nivel_risco: 2 };
  const criada = await chamar("POST", "/ocorrencias", nova);
  assert.equal(criada.status, 201);
  const id = criada.corpo.id;

  assert.equal((await chamar("GET", `/ocorrencias/${id}`)).corpo.descricao, "Humilhação pública.");
  assert.ok((await chamar("GET", "/ocorrencias")).corpo.some((o) => o.id === id));

  const atualizada = await chamar("PUT", `/ocorrencias/${id}`, { nivel_risco: 5 });
  assert.equal(atualizada.status, 200);
  assert.equal(atualizada.corpo.nivel_risco, 5);
  assert.equal(atualizada.corpo.local, "Trabalho"); // PUT parcial preserva o resto

  assert.equal((await chamar("DELETE", `/ocorrencias/${id}`)).status, 200);
  assert.equal((await chamar("GET", `/ocorrencias/${id}`)).status, 404);
});

test("validação devolve 400 com lista de erros", async () => {
  const r = await chamar("POST", "/ocorrencias", { descricao: "", nivel_risco: 9 });
  assert.equal(r.status, 400);
  assert.ok(r.corpo.erros.length >= 3);
});

test("JSON malformado devolve 400", async () => {
  const r = await chamar("POST", "/ocorrencias", "{ quebrado");
  assert.equal(r.status, 400);
});

test("id inexistente ou inválido devolve 404", async () => {
  assert.equal((await chamar("GET", "/contatos/9999")).status, 404);
  assert.equal((await chamar("PUT", "/contatos/abc", { nome: "x" })).status, 404);
  assert.equal((await chamar("DELETE", "/contatos/9999")).status, 404);
});

test("relacionamento: evidência exige ocorrência existente", async () => {
  const ruim = await chamar("POST", "/evidencias", { ocorrenciaId: 9999, tipo: "foto", nome: "x.png" });
  assert.equal(ruim.status, 400);
  assert.match(ruim.corpo.erros[0], /Não existe ocorrência/);

  const boa = await chamar("POST", "/evidencias", { ocorrenciaId: "1", tipo: "foto", nome: "x.png" });
  assert.equal(boa.status, 201);
  assert.equal(boa.corpo.ocorrenciaId, 1); // normalizado para número
});

test("relacionamento: encaminhamento valida ocorrência e serviço", async () => {
  const r = await chamar("POST", "/encaminhamentos", { ocorrenciaId: 1, servicoId: 9999, data: "01/11/2026", status: "Concluído" });
  assert.equal(r.status, 400);
  assert.match(r.corpo.erros[0], /Não existe serviço/);
});

test("remover ocorrência remove evidências e encaminhamentos (cascata)", async () => {
  const oc = (await chamar("POST", "/ocorrencias", { data_ocorrencia: "2026-11-02 08:00", tipo_violencia: "Física", descricao: "Teste cascata", nivel_risco: 3 })).corpo;
  await chamar("POST", "/evidencias", { ocorrenciaId: oc.id, tipo: "doc", nome: "laudo.pdf" });
  await chamar("POST", "/encaminhamentos", { ocorrenciaId: oc.id, servicoId: 1, data: "02/11/2026", status: "Em Andamento" });

  await chamar("DELETE", `/ocorrencias/${oc.id}`);
  assert.equal((await chamar("GET", `/evidencias?ocorrenciaId=${oc.id}`)).corpo.length, 0);
  assert.equal((await chamar("GET", `/encaminhamentos?ocorrenciaId=${oc.id}`)).corpo.length, 0);
});

test("só um contato pode ser a prioridade", async () => {
  await chamar("PUT", "/contatos/2", { prioridade: true });
  const lista = (await chamar("GET", "/contatos")).corpo;
  assert.deepEqual(lista.filter((c) => c.prioridade).map((c) => c.id), [2]);
});

test("campos desconhecidos no corpo são descartados", async () => {
  const r = await chamar("POST", "/contatos", { nome: "Ana", telefone: "190", id: 999, invasor: "x" });
  assert.equal(r.status, 201);
  assert.notEqual(r.corpo.id, 999);
  assert.equal(r.corpo.invasor, undefined);
});

test("CRUD de eventos valida formato de data e hora", async () => {
  const ruim = await chamar("POST", "/eventos", { titulo: "x", data: "27/10/2026" });
  assert.equal(ruim.status, 400);
  const ok = await chamar("POST", "/eventos", { titulo: "Dentista", data: "2026-11-20", horaInicio: "09:00", horaFim: "10:00" });
  assert.equal(ok.status, 201);
  assert.equal((await chamar("DELETE", `/eventos/${ok.corpo.id}`)).status, 200);
});
