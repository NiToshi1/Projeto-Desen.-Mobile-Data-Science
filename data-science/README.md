# Data Science — indicador de contexto territorial

> **Protótipo acadêmico.** O resultado é uma **estimativa acadêmica** do *contexto do município*, não do risco de uma
> pessoa. Não substitui os serviços oficiais. Em risco imediato, ligue **190** ou **180**.

**Pergunta:** dado o histórico recente de um município (com 20 mil habitantes ou mais), qual a probabilidade de ele estar,
no ano seguinte, entre os 25% com maior taxa de homicídios de mulheres?
O app mostra a resposta como **Baixo / Médio / Alto** no Espaço Seguro (aba *Rede de Apoio*), sempre com o aviso acima.

## Como rodar

```bash
cd data-science
pip install -r requirements.txt
python baixar_dados.py          # opcional: baixa de novo a base bruta (alguns minutos)
jupyter notebook notebook.ipynb # Kernel → Restart & Run All
```

O `notebook.ipynb` já está **executado** (saídas e gráficos visíveis). Ao rodar a última seção, ele regrava
`../api/dados/risco_territorial.json`, que a API serve em `GET /risco-territorial`.

## Arquivos

| Arquivo | O que é |
|---|---|
| `notebook.ipynb` | Pipeline completo: governança → qualidade → tratamento → EDA → modelagem → avaliação → integração |
| `baixar_dados.py` | Baixa a base bruta pela API pública do Ipeadata (sem tratar nada) |
| `dados/atlas_violencia_municipios_bruto.csv` | **Base bruta** (intocada): homicídios F/M/total e população por município × ano, 2010–2025 |
| `dados/atlas_violencia_brasil_uf_referencia.csv` | Totais nacionais e por UF, usados só para conferir a acurácia |
| `dados/territorios_*_bruto.csv` | Nome, capital e área dos municípios e UFs |
| `dados/painel_municipio_ano_tratado.csv` | **Base tratada** (gerada pelo notebook) |
| `dados/FONTE.json` | Data de acesso e séries usadas |

## Base de dados

**Atlas da Violência (Ipea / FBSP)**, séries municipais `AVIOL12_*` do Ipeadata — dados primários do SIM/DataSUS
(Ministério da Saúde) e população TCU/IBGE. Está entre as bases sugeridas pelo Documento Orientador (Seção 5.3).
Dados **agregados**, sem informação pessoal. Ficha completa de governança e dicionário de dados: Seção 2 do notebook.

## Resumo dos resultados

| Etapa | Resultado |
|---|---|
| Qualidade | Erro real encontrado: em **2020** as séries municipais masculina e total não batem com o total nacional (masculino soma 8% do nacional); **64 municípios com área = 0 km²** (ausente disfarçado); ~5% das linhas com sexo ignorado |
| Tratamento | 2020 masculino/total invalidados e interpolados por município; área 0 → ausente; município sem dado de homicídio **não** vira zero; outliers sinalizados, não removidos |
| Modelos | Linha de base (persistência), Regressão Logística e Random Forest; validação cruzada em 5 partes agrupadas por município; teste temporal em 2021–2022 |
| Desempenho | Veja as tabelas das Seções 6 e 7 do notebook (ROC-AUC na faixa de 0,7; precisão da classe “alto” baixa) |
| Integração | `api/dados/risco_territorial.json` → `GET /risco-territorial` → card “Contexto da sua região” no app |

## Limitações (resumo)

Só mede violência **letal** (a não letal é muito subnotificada); indicador do **território**, nunca de uma pessoa;
município pequeno tem poucos casos e taxas instáveis (por isso a cobertura é de 20 mil hab. ou mais);
correlação não é causa. Detalhes na Seção 9 do notebook.
