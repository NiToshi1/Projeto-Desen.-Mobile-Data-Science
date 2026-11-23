// Testes de integração da API (node --test). Usam uma cópia temporária
// de dados/ (modo JSON), então os arquivos de exemplo e o banco nunca são alterados.
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
  process.env.DADOS_DIR = dir; // os testes usam uma cópia temporária, nunca api/dados
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

test("CRUD completo de ocorrências (data automática)", async () => {
  const criada = await chamar("POST", "/ocorrencias", { local: "Trabalho", descricao: "Humilhação pública.", nivel_perigo: 3 });
  assert.equal(criada.status, 201);
  assert.ok(criada.corpo.data_ocorrencia); // preenchida pela API
  const id = criada.corpo.id;

  assert.equal((await chamar("GET", `/ocorrencias/${id}`)).corpo.descricao, "Humilhação pública.");
  assert.ok((await chamar("GET", "/ocorrencias")).corpo.some((o) => o.id === id));

  const atualizada = await chamar("PUT", `/ocorrencias/${id}`, { nivel_perigo: 10 });
  assert.equal(atualizada.status, 200);
  assert.equal(atualizada.corpo.nivel_perigo, 10);
  assert.equal(atualizada.corpo.local, "Trabalho"); // PUT parcial preserva o resto

  assert.equal((await chamar("DELETE", `/ocorrencias/${id}`)).status, 200);
  assert.equal((await chamar("GET", `/ocorrencias/${id}`)).status, 404);
});

test("nível de perigo só aceita inteiros de 1 a 10", async () => {
  for (const nivel of [0, 11, 5.5, "alto", undefined]) {
    const r = await chamar("POST", "/ocorrencias", { descricao: "x", nivel_perigo: nivel });
    assert.equal(r.status, 400, `nível ${nivel} deveria ser recusado`);
    assert.match(r.corpo.erros[0], /nivel_perigo/);
  }
  assert.equal((await chamar("POST", "/ocorrencias", { nivel_perigo: 1 })).status, 201);
  assert.equal((await chamar("POST", "/ocorrencias", { nivel_perigo: 10 })).status, 201);
});

test("JSON malformado devolve 400", async () => {
  assert.equal((await chamar("POST", "/ocorrencias", "{ quebrado")).status, 400);
});

test("id inexistente ou inválido devolve 404", async () => {
  assert.equal((await chamar("GET", "/guardioes/9999")).status, 404);
  assert.equal((await chamar("PUT", "/guardioes/abc", { nome: "x" })).status, 404);
  assert.equal((await chamar("DELETE", "/guardioes/9999")).status, 404);
});

test("relacionamento: ocorrência valida o guardião", async () => {
  const ruim = await chamar("POST", "/ocorrencias", { nivel_perigo: 4, guardiao_id: 9999 });
  assert.equal(ruim.status, 400);
  assert.match(ruim.corpo.erros[0], /Não existe guardião/);

  const boa = await chamar("POST", "/ocorrencias", { nivel_perigo: 4, guardiao_id: "1" });
  assert.equal(boa.status, 201);
  assert.equal(boa.corpo.guardiao_id, 1); // normalizado para número

  const troca = await chamar("PUT", `/ocorrencias/${boa.corpo.id}`, { guardiao_id: 9999 });
  assert.equal(troca.status, 400);
});

test("remover um guardião mantém a ocorrência, sem guardião", async () => {
  const g = (await chamar("POST", "/guardioes", { nome: "Temporária", telefone: "190" })).corpo;
  const oc = (await chamar("POST", "/ocorrencias", { nivel_perigo: 5, guardiao_id: g.id })).corpo;

  assert.equal((await chamar("DELETE", `/guardioes/${g.id}`)).status, 200);
  const depois = await chamar("GET", `/ocorrencias/${oc.id}`);
  assert.equal(depois.status, 200);
  assert.equal(depois.corpo.guardiao_id, null);
});

test("guardiões: validação e só um 'chamar primeiro'", async () => {
  assert.equal((await chamar("POST", "/guardioes", { telefone: "190" })).status, 400);
  assert.equal((await chamar("POST", "/guardioes", { nome: "X", telefone: "  " })).status, 400);
  assert.equal((await chamar("POST", "/guardioes", { nome: "X", telefone: "190", prioridade: "sim" })).status, 400);

  await chamar("PUT", "/guardioes/2", { prioridade: true });
  const lista = (await chamar("GET", "/guardioes")).corpo;
  assert.deepEqual(lista.filter((g) => g.prioridade).map((g) => g.id), [2]);
});

test("campos desconhecidos no corpo são descartados", async () => {
  const r = await chamar("POST", "/guardioes", { nome: "Ana", telefone: "190", id: 999, invasor: "x" });
  assert.equal(r.status, 201);
  assert.notEqual(r.corpo.id, 999);
  assert.equal(r.corpo.invasor, undefined);
});

test("eventos: validação, alterar, filtrar por data e excluir", async () => {
  assert.equal((await chamar("POST", "/eventos", { titulo: "x", data: "27/10/2026" })).status, 400);
  assert.equal((await chamar("POST", "/eventos", { titulo: "x", data: "2026-12-05", hora_inicio: "25:99" })).status, 400);

  const criado = (await chamar("POST", "/eventos", { titulo: "Consulta", data: "2026-12-05", hora_inicio: "09:00", hora_fim: "10:00" })).corpo;
  const alterado = await chamar("PUT", `/eventos/${criado.id}`, { titulo: "Consulta de retorno" });
  assert.equal(alterado.corpo.titulo, "Consulta de retorno");
  assert.equal(alterado.corpo.data, "2026-12-05"); // não mudou

  const doDia = (await chamar("GET", "/eventos?data=2026-12-05")).corpo;
  assert.ok(doDia.some((e) => e.id === criado.id) && doDia.every((e) => e.data === "2026-12-05"));

  assert.equal((await chamar("DELETE", `/eventos/${criado.id}`)).status, 200);
  assert.equal((await chamar("GET", `/eventos/${criado.id}`)).status, 404);
});

test("indicador de risco territorial: metadados trazem o aviso de estimativa acadêmica", async () => {
  const r = await chamar("GET", "/risco-territorial");
  assert.equal(r.status, 200);
  assert.match(r.corpo.metadados.aviso, /Estimativa acadêmica/);
  assert.equal(r.corpo.ufs.length, 27);
  assert.ok(["Baixo", "Médio", "Alto"].includes(r.corpo.ufs[0].categoria));
  assert.equal(r.corpo.municipios, undefined); // lista completa só pela rota de municípios
});

test("indicador de risco territorial: busca de municípios por UF e nome (sem acento)", async () => {
  const r = await chamar("GET", "/risco-territorial/municipios?uf=sp&busca=sao jose");
  assert.equal(r.status, 200);
  assert.match(r.corpo.aviso, /Estimativa acadêmica/);
  assert.ok(r.corpo.municipios.length > 0 && r.corpo.municipios.length <= 50);
  assert.ok(r.corpo.municipios.every((m) => m.uf === "SP" && /sao jose/i.test(m.nome.normalize("NFD").replace(/[̀-ͯ]/g, ""))));
});

test("indicador de risco territorial: UF inválida -> 400 e município inexistente -> 404", async () => {
  assert.equal((await chamar("GET", "/risco-territorial/municipios")).status, 400);
  assert.equal((await chamar("GET", "/risco-territorial/municipios?uf=XX")).status, 400);
  assert.equal((await chamar("GET", "/risco-territorial/municipios/0000000")).status, 404);
  const ok = await chamar("GET", "/risco-territorial/municipios/3550308");
  assert.equal(ok.status, 200);
  assert.equal(ok.corpo.municipio.nome, "São Paulo");
});

test("evento: data que não existe (31/02) devolve 400, mas 29/02 de ano bissexto é aceita", async () => {
  assert.equal((await chamar("POST", "/eventos", { titulo: "x", data: "2026-02-31" })).status, 400);
  assert.equal((await chamar("POST", "/eventos", { titulo: "x", data: "2027-04-31" })).status, 400);
  assert.equal((await chamar("POST", "/eventos", { titulo: "x", data: "2026-13-01" })).status, 400);
  const bissexto = await chamar("POST", "/eventos", { titulo: "Bissexto", data: "2028-02-29" });
  assert.equal(bissexto.status, 201);
  assert.equal((await chamar("POST", "/eventos", { titulo: "x", data: "2027-02-29" })).status, 400);
  await chamar("DELETE", `/eventos/${bissexto.corpo.id}`);
});

test("com API_TOKEN, rotas exigem x-api-key (401) e GET / continua aberto", async () => {
  process.env.API_TOKEN = "segredo-de-teste";
  const { criarApp } = require("../server");
  const protegido = criarApp().listen(0);
  delete process.env.API_TOKEN;
  try {
    const url = `http://localhost:${protegido.address().port}`;
    assert.equal((await fetch(`${url}/`)).status, 200);
    assert.equal((await fetch(`${url}/eventos`)).status, 401);
    assert.equal((await fetch(`${url}/eventos`, { headers: { "x-api-key": "errada" } })).status, 401);
    assert.equal((await fetch(`${url}/eventos`, { headers: { "x-api-key": "segredo-de-teste" } })).status, 200);
  } finally {
    protegido.close();
  }
});

test("corpo muito grande devolve 413 (não 500) e a API continua no ar", async () => {
  const r = await chamar("POST", "/ocorrencias", { nivel_perigo: 3, descricao: "x".repeat(300_000) });
  assert.equal(r.status, 413);
  assert.equal((await chamar("GET", "/")).status, 200);
});
