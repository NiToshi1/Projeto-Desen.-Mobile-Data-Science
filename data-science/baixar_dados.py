"""Baixa a base BRUTA do Atlas da Violência (Ipea) pela API pública do Ipeadata.

Uso:  python baixar_dados.py        (grava em data-science/dados/)

Nada é tratado aqui: os valores são gravados exatamente como a API devolve.
A única seleção é de PERÍODO (anos >= 2010) para o arquivo não ficar gigante.
A API ignora filtros no servidor e devolve a série inteira, por isso o download leva alguns minutos.
"""
import datetime
import json
import pathlib

import pandas as pd
import requests

PASTA = pathlib.Path(__file__).parent / "dados"
PASTA.mkdir(exist_ok=True)
API = "http://www.ipeadata.gov.br/api/odata4"
ANO_INICIAL = 2010
SERIES = {
    "AVIOL12_HOMICF": "homicidios_feminino",    # SIM/DataSUS, CID-10 X85-Y09 e Y35, sexo feminino
    "AVIOL12_HOMICM": "homicidios_masculino",   # idem, sexo masculino
    "AVIOL12_HOMIC": "homicidios_total",        # idem, todos os sexos (inclui sexo ignorado)
    "AVIOL12_VIOLPOP": "populacao",             # estimativa TCU/IBGE ajustada
}

municipios, referencia = [], []
for codigo, nome in SERIES.items():
    resposta = requests.get(f"{API}/ValoresSerie(SERCODIGO='{codigo}')", timeout=900)
    resposta.raise_for_status()
    df = pd.DataFrame(resposta.json()["value"])
    df["ano"] = df["VALDATA"].str[:4].astype(int)
    df = df[df["ano"] >= ANO_INICIAL].assign(variavel=nome)
    colunas = ["SERCODIGO", "variavel", "ano", "TERCODIGO", "VALVALOR"]
    municipios.append(df[df["NIVNOME"] == "Municípios"][colunas])
    referencia.append(df[df["NIVNOME"].isin(["Brasil", "Estados"])][colunas + ["NIVNOME"]])
    print(codigo, "ok", flush=True)

pd.concat(municipios).to_csv(PASTA / "atlas_violencia_municipios_bruto.csv", index=False, encoding="utf-8")
pd.concat(referencia).to_csv(PASTA / "atlas_violencia_brasil_uf_referencia.csv", index=False, encoding="utf-8")

territorios = pd.DataFrame(requests.get(f"{API}/Territorios", timeout=900).json()["value"])
territorios[territorios["NIVNOME"] == "Municípios"].to_csv(
    PASTA / "territorios_municipios_bruto.csv", index=False, encoding="utf-8")
territorios[territorios["NIVNOME"] == "Estados"].to_csv(
    PASTA / "territorios_estados_bruto.csv", index=False, encoding="utf-8")

(PASTA / "FONTE.json").write_text(json.dumps({
    "data_acesso": datetime.date.today().isoformat(), "api": API,
    "series": SERIES, "ano_inicial": ANO_INICIAL}, ensure_ascii=False, indent=1), encoding="utf-8")
print("Concluído.")
