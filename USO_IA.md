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

## Entregas 1–3 — Disfarce, Espaço Seguro, navegação e Redux

**Ferramenta:** Claude Code (Anthropic), usado em conjunto por Nicolas Toshio e a IA.

> Os textos exatos dos prompts não foram guardados na época. A tabela abaixo foi **reconstruída pelo histórico do git**
> (datas e arquivos de cada commit); o grupo deve conferir e ajustar o que lembrar.

| Etapa (commit, data) | O que foi gerado com a IA | O que o grupo conferiu |
|---|---|---|
| Base do projeto Expo (`Initial commit`, 24/09; `att 23/10`, 26/10) | Projeto Expo com Expo Router, `AGENTS.md`, configuração do app e do ESLint | Que o app abre com `npx expo start` |
| Calendário disfarçado e Redux (`Finalizações 26/10`, 27/10) | `CalendarioMesScreen`, `HeaderGoogleCalendar`, store Redux Toolkit (`agendaSlice`, `authSlice`, `ocorrenciasSlice`) | Visual de agenda convincente; estado da agenda funcionando |
| Menu, configurações e entrada secreta (`att 26/10`, 27/10) | `GoogleCalendarDrawerModal`, `ConfiguracoesDisfarceModal` (PIN do gatilho secreto), `NovoEventoModal`, `DetalheEventoModal` | Entrada pelo PIN `1234`; criar e ver eventos |
| Espaço Seguro (`att 26/10`, 27/10) | `EspacoSeguroScreen` (abas Ocorrências, Rede de Apoio e Guardiões), `NovaOcorrenciaModal`, `NovoContatoModal`, botão "SAIR AGORA" | Fluxos de cadastro; saída rápida sem confirmação |

## Data Science (Entrega 4)

**Ferramenta:** Claude Code (Anthropic), modelo Claude Sonnet 5.5.

| Prompt (resumo) | O que foi gerado | O que o grupo conferiu |
|---|---|---|
| "Pode seguir" (montar o Data Science da Entrega 4 a partir dos enunciados) | Escolha da base (Atlas da Violência/Ipea, entre as sugeridas), `data-science/baixar_dados.py` e download da base bruta pela API do Ipeadata | Fonte, licença e período; conferir os arquivos em `data-science/dados/` |
| (mesma sessão) pipeline | `data-science/notebook.ipynb`: ficha de governança, dicionário, diagnóstico das 5 dimensões, tratamento, EDA, 2 modelos + linha de base com validação cruzada, avaliação e integração | **Executar do zero** (Restart & Run All), ler cada decisão de tratamento e as limitações; cada aluno assinar a sua etapa |
| (mesma sessão) integração | Rotas `GET /risco-territorial*` na API (+3 testes) e o card `IndicadorTerritorialCard` no app | `npm test` na API; testar o card no celular |

Pontos que o grupo deve saber explicar na apresentação (a IA os encontrou durante o trabalho):
- as séries municipais de **2020** (masculino e total) estavam erradas na fonte e foram tratadas por interpolação;
- a primeira versão do modelo tinha recall de 6% no teste com o corte 0,5; o limiar passou a ser escolhido na validação cruzada;
- o modelo tem desempenho **moderado** e o indicador é do território, não de uma pessoa.

> Registrar aqui qualquer ajuste manual feito pelo grupo no notebook.
