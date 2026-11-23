// ============================================================
// Camada de dados da API. As rotas só conhecem estas 5 funções
// (listar, obter, criar, atualizar, remover). Os dados ficam em arquivos
// JSON na pasta dados/ (sem banco externo, como no exemplo da disciplina);
// os testes apontam DADOS_DIR para uma cópia temporária.
// ============================================================
const fs = require("fs");
const path = require("path");

function repositorioArquivos(pasta) {
  const arquivo = (nome) => path.join(pasta, `${nome}.json`);
  const ler = (nome) => JSON.parse(fs.readFileSync(arquivo(nome), "utf-8"));
  const gravar = (nome, lista) => fs.writeFileSync(arquivo(nome), JSON.stringify(lista, null, 2));

  return {
    async listar(nome, filtros = {}) {
      return ler(nome).filter((i) => Object.entries(filtros).every(([k, v]) => String(i[k]) === String(v)));
    },
    async obter(nome, id) {
      return ler(nome).find((i) => i.id === id) || null;
    },
    async criar(nome, dados) {
      const lista = ler(nome);
      const novo = { id: lista.reduce((maior, i) => Math.max(maior, i.id), 0) + 1, ...dados };
      gravar(nome, [...lista, novo]);
      return novo;
    },
    async atualizar(nome, id, dados) {
      const lista = ler(nome);
      const i = lista.findIndex((x) => x.id === id);
      if (i === -1) return null;
      lista[i] = { ...lista[i], ...dados, id };
      gravar(nome, lista);
      return lista[i];
    },
    async remover(nome, id) {
      const lista = ler(nome);
      const i = lista.findIndex((x) => x.id === id);
      if (i === -1) return null;
      const [removido] = lista.splice(i, 1);
      gravar(nome, lista);
      return removido;
    },
  };
}

function criarRepositorio() {
  return { tipo: "arquivos", ...repositorioArquivos(process.env.DADOS_DIR || path.join(__dirname, "dados")) };
}

module.exports = { criarRepositorio };
