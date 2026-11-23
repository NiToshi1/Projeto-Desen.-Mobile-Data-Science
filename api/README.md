# API do aplicativo de apoio camuflado (Entrega 4)

API REST em **Node.js + Express 5**. Os dados ficam em arquivos JSON na pasta `dados/` (sem banco
externo, como no exemplo da disciplina).

```bash
npm install
npm start        # http://localhost:3333  (troque a porta com PORT=4000)
npm test         # 16 testes de integração (em uma cópia temporária dos dados)
```

Teste rápido: `curl http://localhost:3333/` → `{"status":"ok", ..., "dados":"arquivos"}`

## Armazenamento

Cada coleção é um arquivo em [`dados/`](dados) (`eventos.json`, `ocorrencias.json`, `guardioes.json`), lido e gravado
por [`repositorio.js`](repositorio.js). As rotas só usam `listar / obter / criar / atualizar / remover`, então trocar
o armazenamento (por exemplo, por um banco) não mudaria nenhuma rota.

Opcional: `API_TOKEN` no arquivo `.env` (veja `.env.example`) exige o cabeçalho `x-api-key` em todas as rotas, menos `GET /`.

## Rotas

Todas as coleções têm o mesmo conjunto: `GET /x`, `GET /x/:id`, `POST /x`, `PUT /x/:id`, `DELETE /x/:id`.
O `PUT` é parcial (só os campos enviados mudam). A listagem aceita filtro por campo, ex.:
`GET /eventos?data=2026-11-20`.

| Coleção | Campos | Regras |
|---|---|---|
| `/ocorrencias` | `data_ocorrencia` (automática), `local`, `descricao`, `nivel_perigo`, `guardiao_id` | `nivel_perigo` inteiro de 1 a 10; **FK** `guardiao_id` (opcional) validada: 400 se o guardião não existir |
| `/guardioes` | `nome`, `parentesco`, `telefone`, `prioridade` | só um guardião pode ter `prioridade: true`; `DELETE` mantém as ocorrências dele com `guardiao_id: null` |
| `/eventos` | `titulo`, `data` (AAAA-MM-DD), `hora_inicio`, `hora_fim` (HH:MM), `local`, `descricao`, `cor`, `categoria` | |

## Indicador de contexto territorial (Data Science)

Somente leitura. Serve o resultado do modelo de `data-science/notebook.ipynb` (arquivo `dados/risco_territorial.json`).
Toda resposta traz o **aviso de estimativa acadêmica**.

| Rota | O que devolve |
|---|---|
| `GET /risco-territorial` | metadados (aviso, modelo, métricas, faixas) e as 27 UFs com categoria |
| `GET /risco-territorial/municipios?uf=SP&busca=campin` | até 50 municípios da UF (busca sem acento). `uf` é obrigatória: `400` se faltar ou for inválida |
| `GET /risco-territorial/municipios/:codigo` | um município pelo código IBGE; `404` se não coberto (menos de 20 mil hab.) |

## Erros

| Status | Quando |
|---|---|
| `400` | dados inválidos, FK inexistente (`{"erros":[...]}`) ou JSON malformado |
| `401` | só quando `API_TOKEN` está definida: faltou o cabeçalho `x-api-key` correto (`GET /` fica aberto) |
| `404` | id não encontrado ou inválido (`{"erro":"..."}`) |
| `500` | erro interno inesperado (inclui falha do banco) |

Campos que não fazem parte da entidade (inclusive `id`) são descartados no `POST`/`PUT`.

## Observações

- Sem autenticação: é um protótipo acadêmico para rede local. **Não exponha na internet** com dados reais.
- Em modo JSON, `dados/*.json` guarda os dados de demonstração e é reescrito pela API em uso;
  para restaurar, use `git checkout -- api/dados`.
