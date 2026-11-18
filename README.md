# Aplicativo de Apoio Camuflado — Projeto Integrador (2º semestre de 2026)

Tema: **Violência contra a Mulher**. O app se disfarça de uma agenda comum (estilo Google Calendar)
e esconde, atrás de um gatilho secreto, um **Espaço Seguro** para registrar ocorrências, guardar
evidências, acionar a rede de apoio e avisar contatos de confiança.

> **Aviso:** protótipo acadêmico. Não substitui os serviços oficiais de proteção. Em risco
> imediato, ligue **190** (Polícia Militar) ou **180** (Central de Atendimento à Mulher).

## Arquitetura

```
┌──────────────────────────┐   HTTP/JSON    ┌────────────────────────────┐
│ App Expo (React Native)  │ ─────────────▶ │ API Node.js + Express      │
│ src/                     │                │ api/                       │
│  • Disfarce (agenda)     │ ◀───────────── │  • 6 coleções (JSON)       │
│  • Espaço Seguro         │                │  • rotas RESTful completas │
│  • Redux Toolkit (cache) │                │  • validação + relacionam. │
└──────────────────────────┘                └────────────────────────────┘
```

| Camada | Tecnologia | Onde |
|---|---|---|
| App | Expo SDK 58, Expo Router, React Native 0.88 | `src/` |
| Estado | Redux Toolkit (`createAsyncThunk`) | `src/store/` |
| Acesso à API | `fetch` + tratamento de erro único | `src/services/api.js` |
| Back-end | Node.js + Express 5 | `api/server.js` |
| Dados | Arquivos JSON (uma coleção por entidade) | `api/dados/` |

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

O app descobre sozinho o endereço da API: usa o mesmo IP do computador que serve o Expo
(celular e computador na **mesma rede Wi-Fi**). Para forçar outro endereço, copie
`.env.example` para `.env` e ajuste `EXPO_PUBLIC_API_URL` (reinicie o app depois).

Testes da API: `cd api && npm test`.

## Disfarce: entrada e saída rápida

**Entrada** — no calendário: menu lateral → **Configurações** → **Diagnóstico de Sincronização** →
digite o PIN de 4 dígitos (protótipo: `1234`). A tela troca para o Espaço Seguro.

**Saída rápida (quick exit)** — botão **SAIR AGORA** no topo do Espaço Seguro e botão vermelho 👁
no cabeçalho dos modais de cadastro. Um único toque, **sem confirmação**: volta ao calendário
e a store apaga da memória todas as ocorrências e contatos. Respostas da API que cheguem depois da
saída são descartadas.

Com a API fora do ar, o calendário continua abrindo normalmente (sem mensagens de erro, para não
denunciar o app); só o Espaço Seguro mostra o aviso com "Tentar novamente".

## Entidades e relacionamentos

```
Ocorrência (1) ────< (N) Evidência
Ocorrência (1) ────< (N) Encaminhamento (N) >──── (1) Serviço de apoio
Contato de confiança        Evento da agenda (disfarce)
```

Relacionamentos **validados pela API** (400 se o id não existir): `evidencias.ocorrenciaId`,
`encaminhamentos.ocorrenciaId`, `encaminhamentos.servicoId`. Apagar uma ocorrência apaga em
cascata suas evidências e encaminhamentos. Detalhes das rotas em [`api/README.md`](api/README.md).

## Checklist da Entrega 4

- [x] Back-end Node/Express com rotas RESTful completas e erros 400/404/500 (`api/`)
- [x] Mais de uma coleção, uma por CRUD (6 coleções)
- [x] App consumindo a API real, sem `mockData` (`src/services/api.js` + `src/store/`)
- [x] Relacionamentos reais validados pela API
- [x] Entrada + saída rápida funcionando juntas, com dados vindos da API
- [x] Update e Delete funcionando (testes automatizados + "Alterar nível de risco", prioridade de contato, exclusões na UI)
- [ ] Modelo de Data Science integrado ao app (ver `data-science/`, ainda pendente)
- [ ] Matriz de responsabilidades preenchida (abaixo)
- [ ] Kanban exportado em PDF/imagem

## Matriz de responsabilidades

> Preencher com os integrantes do grupo (cada aluno é dono de um CRUD).

| Integrante | CRUD / entidade | Telas | Rotas da API | Data Science |
|---|---|---|---|---|
| _(nome)_ | | | | |
| _(nome)_ | | | | |

## Uso de IA

Ferramentas e prompts registrados em [`USO_IA.md`](USO_IA.md).
