// Testes da API dos CRUDs de Serviços e Eventos (node --test).
// Usam uma cópia temporária de dados/, então os arquivos de exemplo nunca são alterados.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

let servidor;
let base;
let dir;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "api-teste-servicos-"));
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
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  return { status: r.status, corpo: await r.json().catch(() => null) };
}

test("CRUD completo de serviços de apoio", async () => {
  const criado = await chamar("POST", "/servicos", {
    nome: "Casa da Mulher Brasileira",
    tipo: "Acolhimento",
    telefone: "(43) 3333-3333",
    endereco: "Rua A, 10",
    atendimento_24h: true,
    descricao: "Atendimento integral",
  });
  assert.equal(criado.status, 201);
  const id = criado.corpo.id;

  const lido = await chamar("GET", `/servicos/${id}`);
  assert.equal(lido.status, 200);
  assert.equal(lido.corpo.nome, "Casa da Mulher Brasileira");

  // PUT é parcial: só o telefone muda, o resto continua igual
  const alterado = await chamar("PUT", `/servicos/${id}`, { telefone: "(43) 4444-4444" });
  assert.equal(alterado.status, 200);
  assert.equal(alterado.corpo.telefone, "(43) 4444-4444");
  assert.equal(alterado.corpo.nome, "Casa da Mulher Brasileira");

  assert.equal((await chamar("DELETE", `/servicos/${id}`)).status, 200);
  assert.equal((await chamar("GET", `/servicos/${id}`)).status, 404);
});

test("serviço: validação devolve 400 para nome, telefone e 24h inválidos", async () => {
  const semNome = await chamar("POST", "/servicos", { telefone: "190" });
  assert.equal(semNome.status, 400);
  assert.match(semNome.corpo.erros.join(" "), /nome/);

  const semTelefone = await chamar("POST", "/servicos", { nome: "X", telefone: "  " });
  assert.equal(semTelefone.status, 400);
  assert.match(semTelefone.corpo.erros.join(" "), /telefone/);

  const bool = await chamar("POST", "/servicos", { nome: "X", telefone: "190", atendimento_24h: "sim" });
  assert.equal(bool.status, 400);
  assert.match(bool.corpo.erros.join(" "), /atendimento_24h/);
});

test("excluir um serviço apaga os encaminhamentos que o usavam, mas mantém a ocorrência", async () => {
  const servico = (await chamar("POST", "/servicos", { nome: "Serviço temporário", telefone: "100" })).corpo;
  const ocorrencia = (
    await chamar("POST", "/ocorrencias", {
      data_ocorrencia: "2026-11-10 10:00",
      tipo_violencia: "Moral",
      descricao: "Teste de cascata do serviço",
      nivel_risco: 2,
    })
  ).corpo;
  const encaminhamento = await chamar("POST", "/encaminhamentos", {
    ocorrenciaId: ocorrencia.id,
    servicoId: servico.id,
    data: "10/11/2026",
    status: "Em Andamento",
  });
  assert.equal(encaminhamento.status, 201);

  await chamar("DELETE", `/servicos/${servico.id}`);
  const restantes = await chamar("GET", `/encaminhamentos?servicoId=${servico.id}`);
  assert.equal(restantes.corpo.length, 0);
  assert.equal((await chamar("GET", `/ocorrencias/${ocorrencia.id}`)).status, 200);
});

test("eventos: alterar (PUT parcial), filtrar por data e excluir", async () => {
  const criado = (
    await chamar("POST", "/eventos", { titulo: "Consulta", data: "2026-12-05", horaInicio: "09:00", horaFim: "10:00" })
  ).corpo;

  const alterado = await chamar("PUT", `/eventos/${criado.id}`, { titulo: "Consulta de retorno" });
  assert.equal(alterado.status, 200);
  assert.equal(alterado.corpo.titulo, "Consulta de retorno");
  assert.equal(alterado.corpo.data, "2026-12-05"); // não mudou

  const doDia = await chamar("GET", "/eventos?data=2026-12-05");
  assert.ok(doDia.corpo.some((e) => e.id === criado.id));
  assert.ok(doDia.corpo.every((e) => e.data === "2026-12-05"));

  assert.equal((await chamar("DELETE", `/eventos/${criado.id}`)).status, 200);
  assert.equal((await chamar("GET", `/eventos/${criado.id}`)).status, 404);
});

test("eventos: hora e data inválidas devolvem 400", async () => {
  const horaRuim = await chamar("POST", "/eventos", { titulo: "X", data: "2026-12-05", horaInicio: "25:99" });
  assert.equal(horaRuim.status, 400);
  assert.match(horaRuim.corpo.erros.join(" "), /horaInicio/);

  const dataRuim = await chamar("POST", "/eventos", { titulo: "X", data: "05/12/2026" });
  assert.equal(dataRuim.status, 400);
  assert.match(dataRuim.corpo.erros.join(" "), /data/);
});
