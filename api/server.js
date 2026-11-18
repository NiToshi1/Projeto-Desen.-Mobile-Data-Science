// ============================================================
// API REST do aplicativo de apoio camuflado — Entrega 4.
//
// Node.js + Express. Cada entidade é uma coleção (arquivo JSON em
// dados/) com rotas RESTful completas: GET, GET /:id, POST, PUT, DELETE.
//
// Relacionamentos reais, validados pela API antes de salvar:
//   evidencias.ocorrenciaId      -> ocorrencias
//   encaminhamentos.ocorrenciaId -> ocorrencias
//   encaminhamentos.servicoId    -> servicos
// Ao remover uma ocorrência, suas evidências e encaminhamentos
// também são removidos (cascata).
//
// Erros: 400 (dados inválidos / relacionamento inexistente),
// 404 (id não encontrado), 500 (erro interno).
// ============================================================
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const DADOS_DIR = process.env.DADOS_DIR || path.join(__dirname, "dados");

const arquivo = (nome) => path.join(DADOS_DIR, `${nome}.json`);
const lerColecao = (nome) => JSON.parse(fs.readFileSync(arquivo(nome), "utf-8"));
const salvarColecao = (nome, lista) =>
  fs.writeFileSync(arquivo(nome), JSON.stringify(lista, null, 2));
const proximoId = (lista) => lista.reduce((maior, i) => Math.max(maior, i.id), 0) + 1;

const textoValido = (v) => typeof v === "string" && v.trim().length > 0;
const inteiro = (v) => Number.isInteger(Number(v)) && v !== null && v !== "" && v !== true && v !== false;
const dataIso = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const hora = (v) => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

// Fábrica de rotas CRUD.
//   campos:    únicos campos aceitos no corpo (o resto é descartado)
//   validar:   (item) => lista de erros
//   relacionar:(item) => lista de erros de chave estrangeira
//   aoSalvar:  (item, lista) => ajusta a lista antes de gravar (regras de negócio)
//   aoRemover: (item) => limpeza em cascata
function criarRotasCrud(nome, { campos, validar, relacionar, aoSalvar, aoRemover }) {
  const roteador = express.Router();
  // Mantém só os campos permitidos e normaliza chaves estrangeiras ("1" -> 1).
  const filtrar = (corpo) =>
    Object.fromEntries(
      campos
        .filter((c) => corpo && typeof corpo === "object" && c in corpo)
        .map((c) => [c, c.endsWith("Id") && inteiro(corpo[c]) ? Number(corpo[c]) : corpo[c]])
    );
  const erros = (item) => [...validar(item), ...(relacionar ? relacionar(item) : [])];
  const idDe = (req) => Number(req.params.id);

  roteador.get("/", (req, res) => {
    let lista = lerColecao(nome);
    // Filtro simples por campo: GET /evidencias?ocorrenciaId=1
    for (const campo of campos) {
      if (req.query[campo] !== undefined) {
        lista = lista.filter((i) => String(i[campo]) === String(req.query[campo]));
      }
    }
    res.json(lista);
  });

  roteador.get("/:id", (req, res) => {
    const item = lerColecao(nome).find((i) => i.id === idDe(req));
    if (!item) return res.status(404).json({ erro: `${nome} com id ${req.params.id} não encontrado.` });
    res.json(item);
  });

  roteador.post("/", (req, res) => {
    const dados = filtrar(req.body);
    const lista = lerColecao(nome);
    const novo = { id: proximoId(lista), ...dados };
    const e = erros(novo);
    if (e.length) return res.status(400).json({ erros: e });
    lista.push(novo);
    if (aoSalvar) aoSalvar(novo, lista);
    salvarColecao(nome, lista);
    res.status(201).json(novo);
  });

  roteador.put("/:id", (req, res) => {
    const lista = lerColecao(nome);
    const i = lista.findIndex((x) => x.id === idDe(req));
    if (i === -1) return res.status(404).json({ erro: `${nome} com id ${req.params.id} não encontrado.` });
    const atualizado = { ...lista[i], ...filtrar(req.body), id: lista[i].id };
    const e = erros(atualizado);
    if (e.length) return res.status(400).json({ erros: e });
    lista[i] = atualizado;
    if (aoSalvar) aoSalvar(atualizado, lista);
    salvarColecao(nome, lista);
    res.json(atualizado);
  });

  roteador.delete("/:id", (req, res) => {
    const lista = lerColecao(nome);
    const i = lista.findIndex((x) => x.id === idDe(req));
    if (i === -1) return res.status(404).json({ erro: `${nome} com id ${req.params.id} não encontrado.` });
    const [removido] = lista.splice(i, 1);
    salvarColecao(nome, lista);
    if (aoRemover) aoRemover(removido);
    res.json({ removido });
  });

  return roteador;
}

const TIPOS_VIOLENCIA = ["Psicológica", "Física", "Patrimonial", "Moral", "Sexual"];
const TIPOS_EVIDENCIA = ["audio", "foto", "doc"];
const STATUS_ENCAMINHAMENTO = ["Atendimento Agendado", "Em Andamento", "Concluído", "Cancelado"];

function criarApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // ---------- Ocorrências ----------
  app.use(
    "/ocorrencias",
    criarRotasCrud("ocorrencias", {
      campos: ["data_ocorrencia", "tipo_violencia", "local", "descricao", "nivel_risco"],
      validar: (o) => {
        const e = [];
        if (!textoValido(o.descricao)) e.push("O campo 'descricao' é obrigatório.");
        if (!TIPOS_VIOLENCIA.includes(o.tipo_violencia))
          e.push(`O campo 'tipo_violencia' deve ser um de: ${TIPOS_VIOLENCIA.join(", ")}.`);
        if (!inteiro(o.nivel_risco) || o.nivel_risco < 1 || o.nivel_risco > 5)
          e.push("O campo 'nivel_risco' deve ser um inteiro de 1 a 5.");
        if (!textoValido(o.data_ocorrencia)) e.push("O campo 'data_ocorrencia' é obrigatório.");
        return e;
      },
      aoRemover: (o) => {
        for (const filha of ["evidencias", "encaminhamentos"]) {
          salvarColecao(filha, lerColecao(filha).filter((x) => x.ocorrenciaId !== o.id));
        }
      },
    })
  );

  // ---------- Evidências (relaciona com Ocorrências) ----------
  app.use(
    "/evidencias",
    criarRotasCrud("evidencias", {
      campos: ["ocorrenciaId", "tipo", "nome", "descricao", "data_upload"],
      validar: (v) => {
        const e = [];
        if (!inteiro(v.ocorrenciaId)) e.push("O campo 'ocorrenciaId' é obrigatório.");
        if (!textoValido(v.nome)) e.push("O campo 'nome' é obrigatório.");
        if (!TIPOS_EVIDENCIA.includes(v.tipo))
          e.push(`O campo 'tipo' deve ser um de: ${TIPOS_EVIDENCIA.join(", ")}.`);
        return e;
      },
      relacionar: (v) =>
        inteiro(v.ocorrenciaId) && !lerColecao("ocorrencias").some((o) => o.id === Number(v.ocorrenciaId))
          ? [`Não existe ocorrência com id ${v.ocorrenciaId}.`]
          : [],
    })
  );

  // ---------- Serviços de apoio ----------
  app.use(
    "/servicos",
    criarRotasCrud("servicos", {
      campos: ["nome", "tipo", "telefone", "endereco", "atendimento_24h", "descricao"],
      validar: (s) => {
        const e = [];
        if (!textoValido(s.nome)) e.push("O campo 'nome' é obrigatório.");
        if (!textoValido(s.telefone)) e.push("O campo 'telefone' é obrigatório.");
        if (s.atendimento_24h !== undefined && typeof s.atendimento_24h !== "boolean")
          e.push("O campo 'atendimento_24h' deve ser booleano.");
        return e;
      },
      aoRemover: (s) => {
        // Não deixa encaminhamentos apontando para um serviço que deixou de existir.
        salvarColecao("encaminhamentos", lerColecao("encaminhamentos").filter((x) => x.servicoId !== s.id));
      },
    })
  );

  // ---------- Encaminhamentos (relaciona Ocorrências e Serviços) ----------
  app.use(
    "/encaminhamentos",
    criarRotasCrud("encaminhamentos", {
      campos: ["ocorrenciaId", "servicoId", "data", "status"],
      validar: (en) => {
        const e = [];
        if (!inteiro(en.ocorrenciaId)) e.push("O campo 'ocorrenciaId' é obrigatório.");
        if (!inteiro(en.servicoId)) e.push("O campo 'servicoId' é obrigatório.");
        if (!textoValido(en.data)) e.push("O campo 'data' é obrigatório.");
        if (!STATUS_ENCAMINHAMENTO.includes(en.status))
          e.push(`O campo 'status' deve ser um de: ${STATUS_ENCAMINHAMENTO.join(", ")}.`);
        return e;
      },
      relacionar: (en) => {
        const e = [];
        if (inteiro(en.ocorrenciaId) && !lerColecao("ocorrencias").some((o) => o.id === Number(en.ocorrenciaId)))
          e.push(`Não existe ocorrência com id ${en.ocorrenciaId}.`);
        if (inteiro(en.servicoId) && !lerColecao("servicos").some((s) => s.id === Number(en.servicoId)))
          e.push(`Não existe serviço com id ${en.servicoId}.`);
        return e;
      },
    })
  );

  // ---------- Contatos de confiança ----------
  app.use(
    "/contatos",
    criarRotasCrud("contatos", {
      campos: ["nome", "parentesco", "telefone", "contato_confianca", "prioridade"],
      validar: (c) => {
        const e = [];
        if (!textoValido(c.nome)) e.push("O campo 'nome' é obrigatório.");
        if (!textoValido(c.telefone)) e.push("O campo 'telefone' é obrigatório.");
        for (const b of ["contato_confianca", "prioridade"]) {
          if (c[b] !== undefined && typeof c[b] !== "boolean") e.push(`O campo '${b}' deve ser booleano.`);
        }
        return e;
      },
      // Regra de negócio: só um contato pode ser o "chamar primeiro".
      aoSalvar: (c, lista) => {
        if (c.prioridade === true) lista.forEach((x) => { if (x.id !== c.id) x.prioridade = false; });
      },
    })
  );

  // ---------- Eventos da agenda (disfarce) ----------
  app.use(
    "/eventos",
    criarRotasCrud("eventos", {
      campos: ["titulo", "data", "horaInicio", "horaFim", "local", "descricao", "cor", "categoria"],
      validar: (ev) => {
        const e = [];
        if (!textoValido(ev.titulo)) e.push("O campo 'titulo' é obrigatório.");
        if (!dataIso(ev.data)) e.push("O campo 'data' deve estar no formato AAAA-MM-DD.");
        if (ev.horaInicio !== undefined && !hora(ev.horaInicio)) e.push("O campo 'horaInicio' deve estar no formato HH:MM.");
        if (ev.horaFim !== undefined && !hora(ev.horaFim)) e.push("O campo 'horaFim' deve estar no formato HH:MM.");
        return e;
      },
    })
  );

  app.get("/", (req, res) => {
    res.json({ status: "ok", mensagem: "API do aplicativo de apoio camuflado rodando." });
  });

  // JSON malformado no corpo -> 400 (não 500)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ erro: "Corpo da requisição não é um JSON válido." });
    }
    console.error(err);
    res.status(500).json({ erro: "Erro interno no servidor." });
  });

  return app;
}

if (require.main === module) {
  const PORTA = process.env.PORT || 3333;
  criarApp().listen(PORTA, () => {
    console.log(`API rodando em http://localhost:${PORTA}`);
  });
}

module.exports = { criarApp };
