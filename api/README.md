# API do aplicativo de apoio camuflado (Entrega 4)

API REST em **Node.js + Express 5**. Os dados ficam em arquivos JSON em `dados/` (sem banco
externo, para rodar em qualquer notebook só com Node).

```bash
npm install
npm start        # http://localhost:3333  (troque a porta com PORT=4000)
npm test         # 14 testes de integração (usam cópia temporária dos dados)
```

Teste rápido: `curl http://localhost:3333/` → `{"status":"ok", ...}`.

## Rotas

Todas as coleções têm o mesmo conjunto: `GET /x`, `GET /x/:id`, `POST /x`, `PUT /x/:id`, `DELETE /x/:id`.
O `PUT` é parcial (só os campos enviados mudam). A listagem aceita filtro por campo, ex.:
`GET /evidencias?ocorrenciaId=1`.

| Coleção | Campos | Regras |
|---|---|---|
| `/ocorrencias` | `data_ocorrencia`, `tipo_violencia`, `local`, `descricao`, `nivel_risco` | tipo ∈ Psicológica/Física/Patrimonial/Moral/Sexual; nível 1–5; `DELETE` remove evidências e encaminhamentos |
| `/evidencias` | `ocorrenciaId`, `tipo`, `nome`, `descricao`, `data_upload` | **FK** `ocorrenciaId`; tipo ∈ audio/foto/doc |
| `/encaminhamentos` | `ocorrenciaId`, `servicoId`, `data`, `status` | **FKs** `ocorrenciaId` e `servicoId` |
| `/servicos` | `nome`, `tipo`, `telefone`, `endereco`, `atendimento_24h`, `descricao` | `DELETE` remove encaminhamentos que o usavam |
| `/contatos` | `nome`, `parentesco`, `telefone`, `contato_confianca`, `prioridade` | só um contato pode ter `prioridade: true` |
| `/eventos` | `titulo`, `data` (AAAA-MM-DD), `horaInicio`, `horaFim` (HH:MM), `local`, `descricao`, `cor`, `categoria` | |

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
| `404` | id não encontrado (`{"erro":"..."}`) |
| `500` | erro interno inesperado |

Campos que não fazem parte da entidade (inclusive `id`) são descartados no `POST`/`PUT`.

## Observações

- Sem autenticação: é um protótipo acadêmico para rede local. **Não exponha na internet** com dados reais.
- `dados/*.json` guarda os dados iniciais de demonstração e é reescrito pela API em uso;
  para restaurar, use `git checkout -- api/dados`.
