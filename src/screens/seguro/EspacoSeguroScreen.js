import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { alertar } from '../../utils/alerta';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  sairEspacoSeguro,
  excluirOcorrencia,
  excluirGuardiao,
  alternarPrioridadeGuardiao,
  carregarEspacoSeguro,
  limparErro,
} from '../../store';
import { corDoPerigo, rotuloDoPerigo, formatarDataHora } from '../../utils/perigo';
import NovaOcorrenciaModal from './NovaOcorrenciaModal';
import NovoContatoModal from './NovoContatoModal';
import IndicadorTerritorialCard from './IndicadorTerritorialCard';

// ============================================================
// Espaço Seguro (área real): só o essencial.
//  1. Ligar para a polícia (190) com um toque.
//  2. Registrar nova ocorrência (nível de perigo de 1 a 10).
//  3. Guardiões (contatos de confiança), gravados no banco.
//  + indicador territorial (Data Science) no final.
// "SAIR AGORA" volta ao disfarce sem confirmação.
// ============================================================

const NUMERO_POLICIA = '190';

const ligar = (numero) => {
  Linking.openURL(`tel:${String(numero).replace(/[^\d+]/g, '')}`).catch(() => {
    alertar('Não foi possível ligar', `Disque ${numero} no telefone do aparelho.`);
  });
};

export default function EspacoSeguroScreen() {
  const dispatch = useDispatch();

  const ocorrencias = useSelector((state) => state.ocorrencias.ocorrencias);
  const guardioes = useSelector((state) => state.ocorrencias.guardioes);
  const carregando = useSelector((state) => state.ocorrencias.carregando);
  const erro = useSelector((state) => state.ocorrencias.erro);

  const [modalNovaOcorrencia, setModalNovaOcorrencia] = useState(false);
  const [modalNovoGuardiao, setModalNovoGuardiao] = useState(false);

  const handleExcluirOcorrencia = (id) => {
    alertar('Excluir registro', 'Tem certeza de que deseja apagar esta ocorrência?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => dispatch(excluirOcorrencia(id)) },
    ]);
  };

  const handleExcluirGuardiao = (id, nome) => {
    alertar('Remover guardião', `Deseja remover "${nome}" da sua rede de confiança?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => dispatch(excluirGuardiao(id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ================= BARRA SUPERIOR ================= */}
      <View style={styles.topBar}>
        <View style={styles.tituloSecaoTop}>
          <View style={styles.escudoContainer}>
            <Ionicons name="shield-checkmark" size={20} color="#A78BFA" />
          </View>
          <Text style={styles.topBarTitulo}>Espaço Seguro</Text>
        </View>

        <TouchableOpacity
          style={styles.btnDisfarceImediato}
          onPress={() => dispatch(sairEspacoSeguro())}
          activeOpacity={0.8}
        >
          <Ionicons name="eye-off-outline" size={16} color="#FFFFFF" />
          <Text style={styles.txtDisfarceImediato}>SAIR AGORA</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
        {carregando && (
          <View style={styles.statusRede}>
            <ActivityIndicator size="small" color="#A78BFA" />
            <Text style={styles.txtStatusRede}>Sincronizando...</Text>
          </View>
        )}
        {erro && !carregando && (
          <View style={[styles.statusRede, styles.statusRedeErro]}>
            <Ionicons name="cloud-offline-outline" size={18} color="#EF4444" />
            <Text style={[styles.txtStatusRede, { flex: 1 }]}>{erro}</Text>
            <TouchableOpacity
              onPress={() => {
                dispatch(limparErro());
                dispatch(carregarEspacoSeguro());
              }}
            >
              <Text style={styles.txtTentarNovamente}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= AÇÕES PRINCIPAIS ================= */}
        <TouchableOpacity
          style={styles.btnPolicia}
          onPress={() => ligar(NUMERO_POLICIA)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Ligar para a polícia, 190"
        >
          <Ionicons name="call" size={26} color="#FFFFFF" />
          <View>
            <Text style={styles.txtPolicia}>LIGAR PARA A POLÍCIA</Text>
            <Text style={styles.subPolicia}>190 · toque para discar agora</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnRegistrar}
          onPress={() => setModalNovaOcorrencia(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.txtRegistrar}>Registrar Nova Ocorrência</Text>
        </TouchableOpacity>

        {/* ================= OCORRÊNCIAS ================= */}
        <Text style={styles.tituloSecao}>Ocorrências ({ocorrencias.length})</Text>
        {ocorrencias.length === 0 ? (
          <View style={styles.vazioCard}>
            <Ionicons name="shield-outline" size={34} color="#64748B" />
            <Text style={styles.vazioTitulo}>Nenhum registro no momento</Text>
          </View>
        ) : (
          ocorrencias.map((oc) => {
            const cor = corDoPerigo(oc.nivel_perigo);
            return (
              <View key={oc.id} style={styles.cardOcorrencia}>
                <View style={styles.cardOcHeader}>
                  <View style={[styles.badgePerigo, { borderColor: cor }]}>
                    <View style={[styles.pontoPerigo, { backgroundColor: cor }]} />
                    <Text style={[styles.txtBadgePerigo, { color: cor }]}>
                      Perigo {oc.nivel_perigo}/10 · {rotuloDoPerigo(oc.nivel_perigo)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleExcluirOcorrencia(oc.id)}
                    hitSlop={10}
                    accessibilityLabel="Excluir ocorrência"
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.linhaInfo}>
                  <Ionicons name="time-outline" size={14} color="#94A3B8" />
                  <Text style={styles.txtInfo}>{formatarDataHora(oc.data_ocorrencia)}</Text>
                  {oc.local ? (
                    <>
                      <Text style={styles.separadorDot}>•</Text>
                      <Ionicons name="location-outline" size={14} color="#94A3B8" />
                      <Text style={[styles.txtInfo, { flex: 1 }]} numberOfLines={1}>
                        {oc.local}
                      </Text>
                    </>
                  ) : null}
                </View>

                {oc.descricao ? <Text style={styles.relatoTexto}>{oc.descricao}</Text> : null}
              </View>
            );
          })
        )}

        {/* ================= GUARDIÕES ================= */}
        <View style={styles.tituloSecaoLinha}>
          <Text style={styles.tituloSecao}>Guardiões ({guardioes.length})</Text>
          <TouchableOpacity
            style={styles.btnAdicionar}
            onPress={() => setModalNovoGuardiao(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
            <Text style={styles.txtAdicionar}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {guardioes.length === 0 ? (
          <View style={styles.vazioCard}>
            <Ionicons name="people-outline" size={34} color="#64748B" />
            <Text style={styles.vazioTitulo}>Nenhum guardião cadastrado</Text>
            <Text style={styles.vazioSub}>
              Cadastre pessoas de confiança para ligar rapidamente.
            </Text>
          </View>
        ) : (
          guardioes.map((g) => (
            <View
              key={g.id}
              style={[styles.cardGuardiao, g.prioridade && styles.cardGuardiaoPrioritario]}
            >
              <View style={styles.guardiaoAvatar}>
                <Text style={styles.guardiaoAvatarLetra}>{g.nome.charAt(0).toUpperCase()}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.guardiaoNome}>{g.nome}</Text>
                <Text style={styles.guardiaoSub}>
                  {[g.parentesco, g.telefone].filter(Boolean).join(' · ')}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => dispatch(alternarPrioridadeGuardiao(g.id))}
                hitSlop={8}
                style={styles.btnIcone}
                accessibilityLabel={g.prioridade ? 'Remover prioridade' : 'Marcar como chamar primeiro'}
              >
                <Ionicons
                  name={g.prioridade ? 'star' : 'star-outline'}
                  size={20}
                  color={g.prioridade ? '#F59E0B' : '#64748B'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => ligar(g.telefone)}
                hitSlop={8}
                style={[styles.btnIcone, styles.btnLigarGuardiao]}
                accessibilityLabel={`Ligar para ${g.nome}`}
              >
                <Ionicons name="call" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleExcluirGuardiao(g.id, g.nome)}
                hitSlop={8}
                style={styles.btnIcone}
                accessibilityLabel={`Remover ${g.nome}`}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Indicador de contexto territorial (modelo de Data Science) */}
        <IndicadorTerritorialCard />

        <View style={{ height: 40 }} />
      </ScrollView>

      <NovaOcorrenciaModal
        visivel={modalNovaOcorrencia}
        aoFechar={() => setModalNovaOcorrencia(false)}
      />
      <NovoContatoModal
        visivel={modalNovoGuardiao}
        aoFechar={() => setModalNovoGuardiao(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tituloSecaoTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  escudoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitulo: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  btnDisfarceImediato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  txtDisfarceImediato: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  conteudo: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  statusRede: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  statusRedeErro: { borderWidth: 1, borderColor: '#7F1D1D' },
  txtStatusRede: { color: '#CBD5E1', fontSize: 13 },
  txtTentarNovamente: { color: '#A78BFA', fontSize: 13, fontWeight: '700' },
  btnPolicia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  txtPolicia: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.4 },
  subPolicia: { color: '#FECACA', fontSize: 12, marginTop: 2 },
  btnRegistrar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 22,
  },
  txtRegistrar: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  tituloSecao: { color: '#F8FAFC', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  tituloSecaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 2,
  },
  btnAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  txtAdicionar: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  vazioCard: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 22,
    marginBottom: 12,
  },
  vazioTitulo: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginTop: 8 },
  vazioSub: { color: '#94A3B8', fontSize: 12, marginTop: 4, textAlign: 'center' },
  cardOcorrencia: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardOcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgePerigo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pontoPerigo: { width: 8, height: 8, borderRadius: 4 },
  txtBadgePerigo: { fontSize: 12, fontWeight: '700' },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  txtInfo: { color: '#94A3B8', fontSize: 12 },
  separadorDot: { color: '#475569', fontSize: 12 },
  relatoTexto: { color: '#E2E8F0', fontSize: 14, lineHeight: 20 },
  cardGuardiao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardGuardiaoPrioritario: { borderColor: '#F59E0B' },
  guardiaoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardiaoAvatarLetra: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  guardiaoNome: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  guardiaoSub: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  btnIcone: { padding: 6 },
  btnLigarGuardiao: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
});
