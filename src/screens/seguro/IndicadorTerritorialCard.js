import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { obterRiscoTerritorial, buscarMunicipiosRisco } from '../../services/api';

// ============================================================
// Indicador de contexto territorial (Data Science — Entrega 4).
// Mostra a categoria (Baixo / Médio / Alto) estimada pelo modelo do
// notebook data-science/notebook.ipynb para a UF ou o município.
// O aviso de "estimativa acadêmica" vem da própria API e fica SEMPRE
// visível junto do resultado.
//
// O estado é local: ao usar a saída rápida a tela inteira é desmontada
// e nada fica guardado na memória.
// ============================================================
const COR = { Baixo: '#10B981', Médio: '#F59E0B', Alto: '#EF4444' };
const AVISO_PADRAO =
  'Estimativa acadêmica baseada em dados públicos agregados. Indica o contexto do município, não o risco de uma pessoa, e não substitui os serviços oficiais. Em risco imediato, ligue 190 ou 180.';

function Selo({ categoria }) {
  const cor = COR[categoria] || '#94A3B8';
  return (
    <View style={[styles.selo, { borderColor: cor, backgroundColor: `${cor}22` }]}>
      <View style={[styles.seloPonto, { backgroundColor: cor }]} />
      <Text style={[styles.seloTexto, { color: cor }]}>{categoria}</Text>
    </View>
  );
}

export default function IndicadorTerritorialCard() {
  const [dados, setDados] = useState(null); // { metadados, ufs }
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const [uf, setUf] = useState(null);
  const [busca, setBusca] = useState('');
  const [municipio, setMunicipio] = useState(null);
  const [resultado, setResultado] = useState({ chave: null, lista: [] });

  // Carrega o indicador (e de novo a cada "Tentar novamente"). O estado só muda nos callbacks da requisição.
  useEffect(() => {
    let ativo = true;
    obterRiscoTerritorial()
      .then((d) => ativo && setDados(d))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const tentarNovamente = () => {
    setErro(null);
    setCarregando(true);
    setTentativa((n) => n + 1);
  };

  // Busca de municípios da UF escolhida (com um pequeno atraso enquanto a pessoa digita)
  const chave = `${uf}|${busca}`;
  useEffect(() => {
    if (!uf) return undefined;
    let ativo = true;
    const espera = setTimeout(() => {
      buscarMunicipiosRisco(uf, busca)
        .then((r) => ativo && setResultado({ chave, lista: r.municipios }))
        .catch(() => ativo && setResultado({ chave, lista: [] }));
    }, 300);
    return () => {
      ativo = false;
      clearTimeout(espera);
    };
  }, [uf, busca, chave]);

  const buscando = Boolean(uf) && resultado.chave !== chave;
  // enquanto busca, mostra o último resultado da MESMA UF (evita a lista piscar)
  const municipios = resultado.chave?.startsWith(`${uf}|`) ? resultado.lista : [];

  const escolherUf = (sigla) => {
    setUf(sigla);
    setBusca('');
    setMunicipio(null);
  };

  const ufAtual = dados?.ufs.find((u) => u.uf === uf);
  const aviso = dados?.metadados?.aviso || AVISO_PADRAO;

  return (
    <View style={styles.card}>
      <View style={styles.cabecalho}>
        <Ionicons name="analytics-outline" size={20} color="#A78BFA" />
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Contexto da sua região</Text>
          <Text style={styles.subtitulo}>
            Estimativa de violência letal contra mulheres no território
            {dados ? ` (previsão para ${dados.metadados.ano_estimado})` : ''}
          </Text>
        </View>
      </View>

      {/* Aviso obrigatório: logo abaixo do título, sempre visível junto do resultado */}
      <View style={styles.aviso}>
        <Ionicons name="information-circle-outline" size={16} color="#FBBF24" />
        <Text style={styles.avisoTexto}>{aviso}</Text>
      </View>

      {carregando && (
        <View style={styles.linha}>
          <ActivityIndicator size="small" color="#A78BFA" />
          <Text style={styles.texto}>Carregando indicador...</Text>
        </View>
      )}

      {erro && !carregando && (
        <View style={styles.linha}>
          <Ionicons name="cloud-offline-outline" size={18} color="#EF4444" />
          <Text style={[styles.texto, { flex: 1 }]}>{erro}</Text>
          <TouchableOpacity onPress={tentarNovamente}>
            <Text style={styles.tentar}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {dados && (
        <>
          <Text style={styles.rotulo}>1. Escolha o estado (UF)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {dados.ufs.map((u) => (
              <TouchableOpacity
                key={u.uf}
                style={[styles.chip, uf === u.uf && styles.chipAtivo]}
                onPress={() => escolherUf(u.uf)}
              >
                <Text style={[styles.chipTexto, uf === u.uf && styles.chipTextoAtivo]}>{u.uf}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {ufAtual && (
            <View style={styles.resultado}>
              <View style={styles.resultadoTopo}>
                <Text style={styles.resultadoNome}>{ufAtual.nome}</Text>
                <Selo categoria={ufAtual.categoria} />
              </View>
              <Text style={styles.texto}>
                Em relação às demais UFs. {ufAtual.municipios_alto} de {ufAtual.municipios_modelados} municípios
                (20 mil hab. ou mais) estão na categoria Alto.
              </Text>

              <Text style={[styles.rotulo, { marginTop: 14 }]}>2. Procure o seu município (opcional)</Text>
              <TextInput
                style={styles.input}
                value={busca}
                onChangeText={(t) => {
                  setBusca(t);
                  setMunicipio(null);
                }}
                placeholder="Digite o nome da cidade"
                placeholderTextColor="#64748B"
                autoCorrect={false}
              />
              {buscando && <ActivityIndicator size="small" color="#A78BFA" style={{ marginTop: 8 }} />}
              {!buscando && municipios.length === 0 && busca.length > 0 && (
                <Text style={[styles.texto, { marginTop: 8 }]}>
                  Nenhum município encontrado. O modelo só cobre cidades com 20 mil habitantes ou mais.
                </Text>
              )}
              {municipios.slice(0, 6).map((m) => (
                <TouchableOpacity
                  key={m.codigo}
                  style={[styles.itemMunicipio, municipio?.codigo === m.codigo && styles.itemMunicipioAtivo]}
                  onPress={() => setMunicipio(m)}
                >
                  <Text style={styles.itemMunicipioNome}>{m.nome}</Text>
                  <Selo categoria={m.categoria} />
                </TouchableOpacity>
              ))}
              {municipio && (
                <Text style={[styles.texto, { marginTop: 8 }]}>
                  {municipio.nome}: categoria <Text style={{ fontWeight: '700' }}>{municipio.categoria}</Text>
                  {' '}— faixa {dados.metadados.faixas_municipio[municipio.categoria]} de chance de estar entre os
                  25% de municípios com maior taxa.
                </Text>
              )}
            </View>
          )}
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  titulo: { fontSize: 15, fontWeight: '700', color: '#F8FAFC' },
  subtitulo: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  texto: { fontSize: 12, color: '#CBD5E1', lineHeight: 17 },
  tentar: { fontSize: 12, color: '#A78BFA', fontWeight: '700' },
  rotulo: { fontSize: 12, fontWeight: '700', color: '#E2E8F0', marginBottom: 8 },
  chips: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 6,
  },
  chipAtivo: { backgroundColor: 'rgba(124, 58, 237, 0.25)', borderColor: '#A78BFA' },
  chipTexto: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  chipTextoAtivo: { color: '#E9D5FF' },
  resultado: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#334155' },
  resultadoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  resultadoNome: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  seloPonto: { width: 7, height: 7, borderRadius: 4 },
  seloTexto: { fontSize: 12, fontWeight: '700' },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  itemMunicipio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemMunicipioAtivo: { borderColor: '#A78BFA' },
  itemMunicipioNome: { fontSize: 13, color: '#E2E8F0', flex: 1, marginRight: 8 },
  aviso: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  avisoTexto: { flex: 1, fontSize: 11, color: '#FDE68A', lineHeight: 15 },
});
