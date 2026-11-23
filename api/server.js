// ============================================================
// API REST do aplicativo de apoio camuflado — Entrega 4.
//
// Node.js + Express. Três coleções com rotas RESTful completas
// (GET, GET /:id, POST, PUT, DELETE): guardioes, ocorrencias e eventos.
// Os dados ficam em arquivos JSON na pasta dados/ (veja repositorio.js).
//
// Relacionamento real, validado pela API antes de salvar:
//   ocorrencias.guardiao_id -> guardioes   (guardião que sabe da ocorrência)
// Ao remover um guardião, as ocorrências dele continuam existindo
// com guardiao_id = null.
//
// Erros: 400 (dados inválidos / relacionamento inexistente),
// 401 (chave de acesso ausente/errada, só se API_TOKEN estiver definida),
// 404 (id não encontrado), 500 (erro interno).
// ============================================================
require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { criarRepositorio } = require("./repositorio");

const textoValido = (v) => typeof v === "string" && v.trim().length > 0;
const inteiro = (v) => Number.isInteger(Number(v)) && v !== null && v !== "" && v !== true && v !== false;
// AAAA-MM-DD e uma data que existe de verdade (recusa 2026-02-31).
const dataIso = (v) => {
  if (!(typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v))) return false;
  const [a, m, d] = v.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d));
  return dt.getUTCFullYear() === a && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};
const hora = (v) => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

// Fábrica de rotas CRUD.
//   campos:     únicos campos aceitos no corpo (o resto é descartado)
//   padroes:    () => valores padrão de um item novo (ex.: a data de agora)
//   validar:    (item) => lista de erros
//   relacionar: async (item) => lista de erros de chave estrangeira
//   aoSalvar:   async (item) => regra de negócio depois de gravar
//   aoRemover:  async (item) => limpeza depois de remover
function crud(repo, nome, { campos, padroes, validar, relacionar, aoSalvar, aoRemover }) {
  const rotas = express.Router();
  const filtrar = (corpo) =>
    Object.fromEntries(
      campos
        .filter((c) => corpo && typeof corpo === "object" && c in corpo)
        .map((c) => [c, c.endsWith("_id") && inteiro(corpo[c]) ? Number(corpo[c]) : corpo[c]])
    );
  const erros = async (item) => [...validar(item), ...(relacionar ? await relacionar(item) : [])];
  const naoEncontrado = (res, id) => res.status(404).json({ erro: `${nome} com id ${id} não encontrado.` });
  const idDe = (req) => (/^\d+$/.test(req.params.id) ? Number(req.params.id) : null);

  rotas.get("/", async (req, res) => {
    // Filtro simples por campo: GET /eventos?data=2026-11-20
    const filtros = Object.fromEntries(campos.filter((c) => req.query[c] !== undefined).map((c) => [c, req.query[c]]));
    res.json(await repo.listar(nome, filtros));
  });

  rotas.get("/:id", async (req, res) => {
    const id = idDe(req);
    const item = id === null ? null : await repo.obter(nome, id);
    if (!item) return naoEncontrado(res, req.params.id);
    res.json(item);
  });

  rotas.post("/", async (req, res) => {
    const dados = { ...(padroes ? padroes() : {}), ...filtrar(req.body) };
    const e = await erros(dados);
    if (e.length) return res.status(400).json({ erros: e });
    const criado = await repo.criar(nome, dados);
    if (aoSalvar) await aoSalvar(criado);
    res.status(201).json(criado);
  });

  rotas.put("/:id", async (req, res) => {
    const id = idDe(req);
    const atual = id === null ? null : await repo.obter(nome, id);
    if (!atual) return naoEncontrado(res, req.params.id);
    const mudancas = filtrar(req.body);
    const e = await erros({ ...atual, ...mudancas });
    if (e.length) return res.status(400).json({ erros: e });
    const atualizado = await repo.atualizar(nome, id, mudancas);
    if (aoSalvar) await aoSalvar(atualizado);
    res.json(atualizado);
  });

  rotas.delete("/:id", async (req, res) => {
    const id = idDe(req);
    const removido = id === null ? null : await repo.remover(nome, id);
    if (!removido) return naoEncontrado(res, req.params.id);
    if (aoRemover) await aoRemover(removido);
    res.json({ removido });
  });

  return rotas;
}

function criarApp() {
  const repo = criarRepositorio();
  const app = express();
  app.use(cors());

  // Chave de acesso opcional (API_TOKEN). Com a API publicada na internet, só quem
  // envia o cabeçalho x-api-key correto passa; GET / continua aberto (saúde do serviço).
  // Atenção: a chave vai embutida no app, então dificulta o acesso casual, mas não
  // substitui um login por usuário (limitação conhecida do protótipo).
  const chave = process.env.API_TOKEN;
  if (chave) {
    app.use((req, res, next) => {
      if (req.method === "OPTIONS" || req.path === "/") return next();
      const enviada = String(req.get("x-api-key") || "");
      const igual = enviada.length === chave.length && crypto.timingSafeEqual(Buffer.from(enviada), Buffer.from(chave));
      if (!igual) return res.status(401).json({ erro: "Acesso não autorizado." });
      next();
    });
  }

  app.use(express.json({ limit: "100kb" }));

  // ---------- Guardiões (contatos de confiança) ----------
  app.use(
    "/guardioes",
    crud(repo, "guardioes", {
      campos: ["nome", "parentesco", "telefone", "prioridade"],
      validar: (g) => {
        const e = [];
        if (!textoValido(g.nome)) e.push("O campo 'nome' é obrigatório.");
        if (!textoValido(g.telefone)) e.push("O campo 'telefone' é obrigatório.");
        if (g.prioridade !== undefined && typeof g.prioridade !== "boolean") e.push("O campo 'prioridade' deve ser booleano.");
        return e;
      },
      // Regra de negócio: só um guardião pode ser o "chamar primeiro".
      aoSalvar: async (g) => {
        if (g.prioridade !== true) return;
        for (const outro of await repo.listar("guardioes", { prioridade: true })) {
          if (outro.id !== g.id) await repo.atualizar("guardioes", outro.id, { prioridade: false });
        }
      },
      // Garante o relacionamento mesmo em armazenamento sem chave estrangeira (JSON).
      aoRemover: async (g) => {
        for (const oc of await repo.listar("ocorrencias", { guardiao_id: g.id })) {
          await repo.atualizar("ocorrencias", oc.id, { guardiao_id: null });
        }
      },
    })
  );

  // ---------- Ocorrências (relaciona com Guardiões) ----------
  app.use(
    "/ocorrencias",
    crud(repo, "ocorrencias", {
      campos: ["data_ocorrencia", "local", "descricao", "nivel_perigo", "guardiao_id"],
      padroes: () => ({ data_ocorrencia: new Date().toISOString() }),
      validar: (o) => {
        const e = [];
        if (!inteiro(o.nivel_perigo) || o.nivel_perigo < 1 || o.nivel_perigo > 10)
          e.push("O campo 'nivel_perigo' deve ser um inteiro de 1 a 10.");
        if (o.descricao !== undefined && o.descricao !== null && typeof o.descricao !== "string")
          e.push("O campo 'descricao' deve ser texto.");
        return e;
      },
      relacionar: async (o) =>
        inteiro(o.guardiao_id) && !(await repo.obter("guardioes", Number(o.guardiao_id)))
          ? [`Não existe guardião com id ${o.guardiao_id}.`]
          : [],
    })
  );

  // ---------- Eventos da agenda (disfarce) ----------
  app.use(
    "/eventos",
    crud(repo, "eventos", {
      campos: ["titulo", "data", "hora_inicio", "hora_fim", "local", "descricao", "cor", "categoria"],
      validar: (ev) => {
        const e = [];
        if (!textoValido(ev.titulo)) e.push("O campo 'titulo' é obrigatório.");
        if (!dataIso(ev.data)) e.push("O campo 'data' deve estar no formato AAAA-MM-DD.");
        if (ev.hora_inicio != null && !hora(ev.hora_inicio)) e.push("O campo 'hora_inicio' deve estar no formato HH:MM.");
        if (ev.hora_fim != null && !hora(ev.hora_fim)) e.push("O campo 'hora_fim' deve estar no formato HH:MM.");
        return e;
      },
    })
  );

  // ---------- Indicador de contexto territorial (Data Science) ----------
  // Resultado do modelo treinado em data-science/notebook.ipynb (somente leitura).
  // Sempre acompanhado de metadados.aviso: é uma estimativa acadêmica.
  const risco = express.Router();
  const arquivoRisco = path.join(process.env.DADOS_DIR || path.join(__dirname, "dados"), "risco_territorial.json");
  const lerRisco = () => JSON.parse(fs.readFileSync(arquivoRisco, "utf-8"));
  const semAcento = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  risco.get("/", (req, res) => {
    const { metadados, ufs } = lerRisco();
    res.json({ metadados, ufs });
  });

  // GET /risco-territorial/municipios?uf=SP&busca=campin  (uf é obrigatória; no máximo 50 resultados)
  risco.get("/municipios", (req, res) => {
    const dados = lerRisco();
    const uf = String(req.query.uf || "").toUpperCase();
    if (!dados.ufs.some((u) => u.uf === uf)) {
      return res.status(400).json({ erros: ["Informe uma UF válida em 'uf' (ex.: ?uf=SP)."] });
    }
    const busca = semAcento(req.query.busca || "");
    const lista = dados.municipios
      .filter((m) => m.uf === uf && semAcento(m.nome).includes(busca))
      .slice(0, 50);
    res.json({ aviso: dados.metadados.aviso, municipios: lista });
  });

  risco.get("/municipios/:codigo", (req, res) => {
    const dados = lerRisco();
    const m = dados.municipios.find((x) => x.codigo === req.params.codigo);
    if (!m) {
      return res.status(404).json({
        erro: `Município ${req.params.codigo} não encontrado (o modelo cobre municípios com 20 mil habitantes ou mais).`,
      });
    }
    res.json({ aviso: dados.metadados.aviso, municipio: m });
  });
  app.use("/risco-territorial", risco);

  app.get("/", (req, res) => {
    res.json({ status: "ok", mensagem: "API do aplicativo de apoio camuflado rodando.", dados: repo.tipo });
  });

  // JSON malformado no corpo -> 400 (não 500)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ erro: "Corpo da requisição não é um JSON válido." });
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({ erro: "Corpo da requisição grande demais (máximo de 100 KB)." });
    }
    console.error(err);
    res.status(500).json({ erro: "Erro interno no servidor." });
  });

  return app;
}

if (require.main === module) {
  const PORTA = process.env.PORT || 3333;
  const app = criarApp();
  app.listen(PORTA, () => {
    console.log(`API rodando em http://localhost:${PORTA}`);
  });
}

module.exports = { criarApp };
