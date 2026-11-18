# Uso de IA no projeto

Registro das ferramentas de IA e dos prompts usados, conforme a Seção 7 do Documento Orientador.
Todo código gerado foi lido, executado e testado pelo grupo antes de entrar no repositório.

## Entrega 4 — Back-end, integração via API e documentação

**Ferramenta:** Claude Code (Anthropic), modelo Claude Sonnet 5.5.

| Prompt (resumo) | O que foi gerado | O que o grupo conferiu |
|---|---|---|
| "Entre na pasta com os requisitos das entregas e atualize o projeto; liste o que precisar ser feito à parte." | Análise dos documentos das Entregas 2, 3 e 4 e do exemplo de referência (Hotel Aurora); comparação com o estado do app. | Lista de pendências no fim desta etapa. |
| (mesma sessão) criar a API | `api/server.js` (Express, 6 coleções, rotas RESTful, validação de relacionamentos, cascata, erros 400/404/500) e `api/test/api.test.js` (11 testes). | `npm test` verde; rotas testadas com `curl`; dados iniciais migrados do antigo mock. |
| (mesma sessão) integrar o app | `src/services/api.js`, slices Redux com `createAsyncThunk`, ajustes nos modais e em `EspacoSeguroScreen`; remoção dos dados simulados. | `npx tsc --noEmit`, `npx expo lint` e `npx expo export` sem erros. |
| (mesma sessão) saída rápida em modais | `BotaoSaidaRapida` e limpeza dos dados sensíveis da store ao sair. | Teste manual no dispositivo (a fazer pelo grupo). |
| (mesma sessão) documentação | `README.md`, `api/README.md`, `.env.example`, este arquivo. | Revisão do grupo. |

Referência consultada: documentação oficial do Expo SDK 58 (`expo-constants`, variáveis `EXPO_PUBLIC_*`).

## Entregas 1–3

> _Preencher com as ferramentas e prompts usados nas etapas anteriores (telas do disfarce, Espaço
> Seguro, navegação, Redux). Este arquivo não tinha registro dessas etapas no repositório._

## Data Science

> _Preencher quando o notebook for incluído (`data-science/`)._
