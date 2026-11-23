# Agenda Inteligente — Aplicativo de Apoio Camuflado

Projeto Integrador (2º semestre de 2026) · Integrantes: **Nicolas Toshio** e **Fernando Vinicius**

Tema: **Violência contra a Mulher**. O app se disfarça de uma agenda comum (estilo Google Calendar)
e esconde, atrás de um gatilho secreto, um **Espaço Seguro** para registrar ocorrências (com nível
de perigo de 1 a 10), ligar para a polícia com um toque e manter guardiões de confiança.

> **Aviso:** protótipo acadêmico. Não substitui os serviços oficiais de proteção. Em risco
> imediato, ligue **190** (Polícia Militar) ou **180** (Central de Atendimento à Mulher).

## Arquitetura

```
┌──────────────────────────┐  HTTP/JSON  ┌──────────────────────────┐     ┌───────────────────────┐
│ App Expo (React Native)  │ ──────────▶ │ API Node.js + Express    │ ──▶ │ Arquivos JSON         │
│ src/                     │ ◀────────── │ api/                     │     │  • eventos            │
│  • Disfarce: Drawer      │             │  • 3 coleções (CRUD)     │     │  • ocorrencias        │
│  • Espaço Seguro: Tabs   │             │  • validação + relaciona-│     │  • guardioes          │
│    (cada aba com Stack)  │             │    mento                 │     └───────────────────────┘
│  • Redux Toolkit         │             │  • GET /risco-territorial│     (api/dados/*.json)   
│  • Indicador territorial │             └────────────▲─────────────┘
└──────────────────────────┘                          │ risco_territorial.json
                                       ┌──────────────┴─────────────┐
                                       │ Notebook de Data Science   │
                                       │ data-science/notebook.ipynb│
                                       └────────────────────────────┘
```

| Camada | Tecnologia | Onde |
|---|---|---|
| App | Expo SDK 58, Expo Router, React Native 0.88 | `src/` |
| Navegação | Expo Router (layouts por arquivo): Drawer (agenda), Tabs + Stack (Espaço Seguro), `Stack.Protected` para entrada e saída | `src/app/` |
| Estado | Redux Toolkit (`createAsyncThunk`) | `src/store/` |
| Acesso à API | `fetch` + tratamento de erro único | `src/services/api.js` |
| Back-end | Node.js + Express 5 | `api/server.js` |
| Dados | Arquivos JSON (sem banco externo, como no exemplo da disciplina) | `api/repositorio.js`, `api/dados/` |
| Data Science | Python (pandas, scikit-learn), notebook executado | `data-science/` |

## Como rodar

São **dois terminais**: a API precisa estar no ar para o app funcionar.

```bash
# Terminal 1 — API (porta 3333)
cd api
npm install
npm start

# Terminal 2 — App
npm install
npx expo start
```

Os dados ficam em arquivos JSON na pasta `api/dados/` (sem banco, como no exemplo da disciplina) e são
gravados pela API: eventos, ocorrências e guardiões continuam salvos depois de reiniciar a API.

O app não acessa nenhum banco: ele descobre sozinho o endereço da API, usando o mesmo IP do
computador que serve o Expo (celular e computador na **mesma rede Wi-Fi**). Para forçar outro
endereço, copie `.env.example` para `.env` e ajuste `EXPO_PUBLIC_API_URL` (reinicie o app depois).

**Na apresentação:** rode a API no notebook de quem apresentar (`npm start` na pasta `api/`) e deixe o
celular na mesma rede. O enunciado da Entrega 4 aceita a API rodando localmente; não é preciso hospedar em nuvem.
Se a API ficar acessível fora da sua rede, defina `API_TOKEN` (veja `api/.env.example`).

Testes da API: `cd api && npm test` (16 testes de integração, em uma cópia temporária dos dados, sem tocar em `api/dados`).

## Disfarce: entrada e saída rápida

**Entrada** — no calendário: menu lateral → **Configurações** → **Diagnóstico de Sincronização** →
digite o PIN de 4 dígitos (protótipo: `1234`). A tela troca para o Espaço Seguro.

**Agenda (disfarce)** — **Drawer Navigator** com menu lateral e um calendário de verdade:
visualizações Semana e Mês (escolhidas no menu), setas para avançar/voltar, botão "Hoje" e busca
de eventos. **CRUD de agendamentos:** criar (botão +), listar (no calendário), editar (lápis no detalhe do evento) e excluir (lixeira, com confirmação). Eventos ficam salvos pela API.

**Espaço Seguro** — **Tab Navigator** com 3 abas, cada uma com seu **Stack** (formulários abrem
como telas empilhadas):
- *Ocorrências*: botão **Ligar para a polícia (190)** que abre o discador direto, **Registrar nova
  ocorrência** (nível de perigo de 1 a 10, guardião opcional; grava pela API; a lista, a edição e a exclusão ficam em *Ver minhas ocorrências*, fora da tela principal) e
  **Enviar SMS aos guardiões** (abre o app de SMS do celular com o texto e o número de todos os guardiões;
  só funciona no aparelho, não no navegador).
- *Guardiões*: contatos de confiança gravados pela API, com ligação direta, "chamar primeiro", **editar** e remover.
- *Contexto*: indicador territorial do modelo de Data Science (Baixo / Médio / Alto, sempre com o aviso de estimativa acadêmica).

**Saída rápida (quick exit)** — botão vermelho 👁 no cabeçalho de **todas** as telas do Espaço Seguro.
Um único toque, **sem confirmação**: volta ao calendário e a store apaga da memória todas as
ocorrências e guardiões. Respostas da API que cheguem depois da saída são descartadas.

Com a API fora do ar, o calendário continua abrindo normalmente (sem mensagens de erro, para não
denunciar o app); só o Espaço Seguro mostra o aviso com "Tentar novamente".

> **Limitação conhecida (protótipo):** o app e a API não têm login. Quem alcançar a API (rede local)
> pode ler e apagar os dados. O banco só aceita a chave secreta da API (RLS ligado, sem políticas
> para a chave pública). Em produção seria preciso autenticação e políticas por usuário.

## Entidades e relacionamentos

```
Guardião (1) ────< (N) Ocorrência        Evento da agenda (disfarce)
```

Três coleções, uma por CRUD, em arquivos JSON: [`api/dados/`](api/dados) (`eventos.json`, `ocorrencias.json`, `guardioes.json`).
Relacionamento **validado pela API** (400 se o id não existir): `ocorrencias.guardiao_id`, o guardião
de confiança que sabe da ocorrência. Apagar um guardião mantém as ocorrências, com `guardiao_id`
vazio. Só um guardião pode ter a prioridade "chamar primeiro". Detalhes das rotas em
[`api/README.md`](api/README.md).

## Checklist da Entrega 4

- [x] Back-end Node/Express com rotas RESTful completas e erros 400/404/500 (`api/`)
- [x] Mais de uma coleção, uma por CRUD (3 coleções, mais que os 2 integrantes)
- [x] App consumindo a API real, sem `mockData` (`src/services/api.js` + `src/store/`)
- [x] Relacionamento real validado pela API (`ocorrencias.guardiao_id` → `guardioes`)
- [x] Entrada + saída rápida funcionando juntas, com dados vindos da API
- [x] Update e Delete funcionando (testes automatizados, prioridade do guardião e exclusões na UI)
- [x] Modelo de Data Science integrado ao app, com aviso de estimativa acadêmica (`data-science/` → `GET /risco-territorial` → aba *Contexto*)
- [x] Matriz de responsabilidades preenchida (abaixo)
- [ ] Kanban exportado em PDF/imagem

## Data Science: indicador de contexto territorial

Base pública real: **Atlas da Violência (Ipea)**, séries municipais de homicídios e população (via Ipeadata).
O notebook [`data-science/notebook.ipynb`](data-science/README.md) (já executado) cobre governança, qualidade, tratamento,
análise exploratória, dois modelos + linha de base com validação cruzada, métricas completas e a integração.
O modelo estima a probabilidade de um município (20 mil hab. ou mais) ficar entre os 25% com maior taxa de homicídios de mulheres;
o app mostra **Baixo / Médio / Alto** na aba *Contexto* do Espaço Seguro, **sempre com o aviso de estimativa acadêmica**.
É um indicador do *território*, nunca de uma pessoa. Limitações e desempenho: Seções 7 e 9 do notebook.

## Matriz de responsabilidades

Cada aluno é dono de CRUDs (a API tem 3 coleções, mais que o número de integrantes). Etapas do notebook conforme a Seção 3.3 do Documento Orientador.

| Integrante | CRUD / entidade | Telas | Rotas da API | Data Science |
|---|---|---|---|---|
| Nicolas Toshio | Ocorrências, com o relacionamento para Guardiões validado pela API | Espaço Seguro: aba Ocorrências, Nova Ocorrência (nível de perigo 1–10); navegação (`src/app/`: Stack.Protected, Tabs e Stacks) | `/ocorrencias` | Governança e dicionário, qualidade e tratamento, integração com a API e o app (`/risco-territorial`, aba Contexto) |
| Fernando Vinicius | Guardiões e Eventos da agenda | Espaço Seguro: aba Guardiões, Novo Guardião; calendário (disfarce) com Drawer, Novo Evento e Detalhe do Evento | `/guardioes`, `/eventos` | Análise exploratória, modelagem e avaliação |

## Uso de IA

Ferramentas e prompts registrados em [`USO_IA.md`](USO_IA.md).
