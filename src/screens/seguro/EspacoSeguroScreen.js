import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  sairEspacoSeguro,
  removerOcorrencia,
  removerContato,
  alternarPrioridadeContato,
} from '../../store';
import NovaOcorrenciaModal from './NovaOcorrenciaModal';
import NovoContatoModal from './NovoContatoModal';

export default function EspacoSeguroScreen() {
  const dispatch = useDispatch();

  const ocorrencias = useSelector((state) => state.ocorrencias.ocorrencias);
  const contatos = useSelector((state) => state.ocorrencias.contatos);
  const servicosApoio = useSelector((state) => state.ocorrencias.servicosApoio);

  const [abaAtiva, setAbaAtiva] = useState('ocorrencias'); // 'ocorrencias' | 'rede' | 'guardioes'
  const [modalNovaOcorrencia, setModalNovaOcorrencia] = useState(false);
  const [modalNovoContato, setModalNovoContato] = useState(false);

  // Saída rápida de emergência (botão de pânico / disfarce instantâneo)
  const handleDisfarceImediato = () => {
    dispatch(sairEspacoSeguro());
  };

  const handleLigar = (telefone, nomeServico) => {
    const numLimpo = telefone.replace(/\D/g, '');
    Alert.alert(
      'Iniciar Ligação',
      `Deseja discar para ${nomeServico} (${telefone})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ligar',
          onPress: () => {
            Linking.openURL(`tel:${numLimpo}`).catch(() => {
              Alert.alert('Erro', 'Não foi possível acionar o discador.');
            });
          },
        },
      ]
    );
  };

  const handleExcluirOcorrencia = (id) => {
    Alert.alert(
      'Excluir registro',
      'Tem certeza de que deseja apagar esta ocorrência do seu histórico seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => dispatch(removerOcorrencia(id)),
        },
      ]
    );
  };

  const handleExcluirContato = (id, nome) => {
    Alert.alert(
      'Remover Guardião',
      `Deseja remover "${nome}" da sua rede de confiança?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => dispatch(removerContato(id)),
        },
      ]
    );
  };

  const totalEvidencias = ocorrencias.reduce(
    (acc, oc) => acc + (oc.evidencias?.length || 0),
    0
  );

  const riscoMaximo = ocorrencias.reduce(
    (max, oc) => Math.max(max, oc.nivel_risco || 0),
    0
  );

  const getRiscoCor = (nivel) => {
    switch (nivel) {
      case 5:
        return '#EF4444'; // Crítico
      case 4:
        return '#F97316'; // Severo
      case 3:
        return '#F59E0B'; // Alto
      case 2:
        return '#3B82F6'; // Moderado
      default:
        return '#10B981'; // Leve
    }
  };

  const getRiscoRotulo = (nivel) => {
    switch (nivel) {
      case 5:
        return 'Nível 5 · Crítico';
      case 4:
        return 'Nível 4 · Severo';
      case 3:
        return 'Nível 3 · Alto';
      case 2:
        return 'Nível 2 · Moderado';
      default:
        return 'Nível 1 · Leve';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ================= BARRA SUPERIOR DE SEGURANÇA & PÂNICO ================= */}
      <View style={styles.topBar}>
        <View style={styles.tituloSecaoTop}>
          <View style={styles.escudoContainer}>
            <Ionicons name="shield-checkmark" size={20} color="#A78BFA" />
          </View>
          <View>
            <Text style={styles.topBarTitulo}>Espaço Seguro</Text>
            <View style={styles.badgeCripto}>
              <View style={styles.pontoVerde} />
              <Text style={styles.topBarSub}>Criptografado e Protegido</Text>
            </View>
          </View>
        </View>

        {/* Botão de Pânico / Saída Imediata */}
        <TouchableOpacity
          style={styles.btnDisfarceImediato}
          onPress={handleDisfarceImediato}
          activeOpacity={0.8}
        >
          <Ionicons name="eye-off-outline" size={16} color="#FFFFFF" />
          <Text style={styles.txtDisfarceImediato}>SAIR AGORA</Text>
        </TouchableOpacity>
      </View>

      {/* ================= NAVEGAÇÃO DE ABAS DO ESPAÇO SEGURO ================= */}
      <View style={styles.abasContainer}>
        {[
          { id: 'ocorrencias', nome: 'Ocorrências', icone: 'document-text-outline' },
          { id: 'rede', nome: 'Rede de Apoio', icone: 'heart-outline' },
          { id: 'guardioes', nome: 'Guardiões', icone: 'people-outline' },
        ].map((aba) => {
          const ativa = abaAtiva === aba.id;
          return (
            <TouchableOpacity
              key={aba.id}
              style={[styles.abaBotao, ativa && styles.abaBotaoAtiva]}
              onPress={() => setAbaAtiva(aba.id)}
            >
              <Ionicons
                name={aba.icone}
                size={18}
                color={ativa ? '#A78BFA' : '#94A3B8'}
              />
              <Text style={[styles.abaTexto, ativa && styles.abaTextoAtiva]}>
                {aba.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ================= CONTEÚDO DA ABA ATIVA ================= */}
      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* ==================== ABA 1: OCORRÊNCIAS ==================== */}
        {abaAtiva === 'ocorrencias' && (
          <View>
            {/* Cards de Métricas */}
            <View style={styles.metricasContainer}>
              <View style={styles.cardMetrica}>
                <Text style={styles.numMetrica}>{ocorrencias.length}</Text>
                <Text style={styles.legendaMetrica}>Ocorrências Registradas</Text>
              </View>

              <View style={styles.cardMetrica}>
                <Text
                  style={[
                    styles.numMetrica,
                    { color: getRiscoCor(riscoMaximo) },
                  ]}
                >
                  {riscoMaximo > 0 ? `${riscoMaximo}/5` : '0/5'}
                </Text>
                <Text style={styles.legendaMetrica}>Risco Máximo</Text>
              </View>

              <View style={styles.cardMetrica}>
                <Text style={styles.numMetrica}>{totalEvidencias}</Text>
                <Text style={styles.legendaMetrica}>Evidências Arquivadas</Text>
              </View>
            </View>

            {/* Botão de Registro */}
            <TouchableOpacity
              style={styles.btnRegistrarOcorrencia}
              onPress={() => setModalNovaOcorrencia(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
              <Text style={styles.txtRegistrarOcorrencia}>Registrar Nova Ocorrência</Text>
            </TouchableOpacity>

            {/* Linha do Tempo / Lista de Ocorrências */}
            <View style={styles.listaOcorrencias}>
              {ocorrencias.length === 0 ? (
                <View style={styles.vazioCard}>
                  <Ionicons name="shield-outline" size={38} color="#64748B" />
                  <Text style={styles.vazioTitulo}>Nenhum registro no momento</Text>
                  <Text style={styles.vazioSub}>
                    Seu espaço seguro está pronto para documentar qualquer relato com segurança.
                  </Text>
                </View>
              ) : (
                ocorrencias.map((oc) => {
                  const riscoCor = getRiscoCor(oc.nivel_risco);
                  return (
                    <View key={oc.id} style={styles.cardOcorrencia}>
                      {/* Topo do Card */}
                      <View style={styles.cardOcHeader}>
                        <View style={styles.badgeViolencia}>
                          <Text style={styles.txtBadgeViolencia}>{oc.tipo_violencia}</Text>
                        </View>
                        <View style={[styles.badgeRisco, { borderColor: riscoCor }]}>
                          <View style={[styles.pontoRisco, { backgroundColor: riscoCor }]} />
                          <Text style={[styles.txtBadgeRisco, { color: riscoCor }]}>
                            {getRiscoRotulo(oc.nivel_risco)}
                          </Text>
                        </View>
                      </View>

                      {/* Informações de Data e Local */}
                      <View style={styles.linhaInfoOc}>
                        <Ionicons name="time-outline" size={14} color="#94A3B8" />
                        <Text style={styles.txtInfoOc}>{oc.data_ocorrencia}</Text>
                        <Text style={styles.separadorDot}>•</Text>
                        <Ionicons name="location-outline" size={14} color="#94A3B8" />
                        <Text style={styles.txtInfoOc} numberOfLines={1}>
                          {oc.local}
                        </Text>
                      </View>

                      {/* Descrição do Relato */}
                      <Text style={styles.relatoTexto}>{oc.descricao}</Text>

                      {/* Evidências Anexadas */}
                      {oc.evidencias && oc.evidencias.length > 0 && (
                        <View style={styles.evidenciasContainer}>
                          <Text style={styles.evidenciasTitulo}>
                            Evidências Anexadas ({oc.evidencias.length})
                          </Text>
                          {oc.evidencias.map((ev) => (
                            <View key={ev.id} style={styles.itemEvidencia}>
                              <Ionicons
                                name={
                                  ev.tipo === 'audio'
                                    ? 'mic'
                                    : ev.tipo === 'foto'
                                    ? 'image'
                                    : 'document-text'
                                }
                                size={16}
                                color="#A78BFA"
                              />
                              <Text style={styles.itemEvidenciaNome} numberOfLines={1}>
                                {ev.nome}
                              </Text>
                              <Text style={styles.itemEvidenciaData}>{ev.data_upload}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Ações inferiores */}
                      <View style={styles.cardOcFooter}>
                        <TouchableOpacity
                          style={styles.btnExcluirOc}
                          onPress={() => handleExcluirOcorrencia(oc.id)}
                        >
                          <Ionicons name="trash-outline" size={15} color="#EF4444" />
                          <Text style={styles.txtExcluirOc}>Excluir registro</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* ==================== ABA 2: REDE DE APOIO ==================== */}
        {abaAtiva === 'rede' && (
          <View>
            {/* Banner de Emergência Nacional */}
            <View style={styles.bannerEmergencia}>
              <View style={styles.bannerEmergenciaInfo}>
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerEmergenciaTitulo}>
                    Em situação de perigo imediato?
                  </Text>
                  <Text style={styles.bannerEmergenciaSub}>
                    Ligue 190 (Polícia Militar) ou 153 (Guarda Municipal / Patrulha).
                  </Text>
                </View>
              </View>
              <View style={styles.bannerBotoesRapidos}>
                <TouchableOpacity
                  style={[styles.btnLigarRapido, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleLigar('190', '190 Polícia Militar')}
                >
                  <Ionicons name="call" size={16} color="#FFFFFF" />
                  <Text style={styles.txtLigarRapido}>LIGAR 190</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnLigarRapido, { backgroundColor: '#7C3AED' }]}
                  onPress={() => handleLigar('180', 'Central 180 Mulher')}
                >
                  <Ionicons name="call" size={16} color="#FFFFFF" />
                  <Text style={styles.txtLigarRapido}>LIGAR 180</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Lista dos Serviços Especializados */}
            <View style={styles.secaoHeaderContainer}>
              <Text style={styles.secaoHeaderTitulo}>
                Serviços Especializados em Londrina - PR
              </Text>
            </View>

            {servicosApoio.map((srv) => (
              <View key={srv.id} style={styles.cardServico}>
                <View style={styles.servicoHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.servicoNome}>{srv.nome}</Text>
                    <Text style={styles.servicoTipo}>{srv.tipo}</Text>
                  </View>
                  {srv.atendimento_24h && (
                    <View style={styles.badge24h}>
                      <Text style={styles.txt24h}>24 HORAS</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.servicoDescricao}>{srv.descricao}</Text>

                <View style={styles.servicoLinha}>
                  <Ionicons name="location-outline" size={14} color="#94A3B8" />
                  <Text style={styles.servicoTextoLinha}>{srv.endereco}</Text>
                </View>

                <View style={styles.servicoFooter}>
                  <View style={styles.servicoTelefoneContainer}>
                    <Ionicons name="call-outline" size={14} color="#A78BFA" />
                    <Text style={styles.servicoTelefone}>{srv.telefone}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.btnLigarServico}
                    onPress={() => handleLigar(srv.telefone, srv.nome)}
                  >
                    <Ionicons name="call" size={15} color="#FFFFFF" />
                    <Text style={styles.txtLigarServico}>Ligar Agora</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==================== ABA 3: GUARDIÕES ==================== */}
        {abaAtiva === 'guardioes' && (
          <View>
            <View style={styles.bannerGuardioes}>
              <Ionicons name="people" size={24} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerGuardioesTitulo}>
                  Rede Pessoal de Confiança
                </Text>
                <Text style={styles.bannerGuardioesSub}>
                  Contatos próximos selecionados por você para socorro rápido e apoio.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnAdicionarGuardião}
              onPress={() => setModalNovoContato(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
              <Text style={styles.txtAdicionarGuardião}>Adicionar Novo Guardião</Text>
            </TouchableOpacity>

            {contatos.map((ct) => (
              <View
                key={ct.id}
                style={[
                  styles.cardContato,
                  ct.prioridade && styles.cardContatoPrioritario,
                ]}
              >
                <View style={styles.contatoHeader}>
                  <View style={styles.contatoAvatar}>
                    <Text style={styles.contatoAvatarLetra}>
                      {ct.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.contatoNomeLinha}>
                      <Text style={styles.contatoNome}>{ct.nome}</Text>
                      {ct.prioridade && (
                        <View style={styles.badgePrioridade}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text style={styles.txtBadgePrioridade}>Chamar Primeiro</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.contatoParentesco}>{ct.parentesco}</Text>
                  </View>

                  {/* Alternar Prioridade */}
                  <TouchableOpacity
                    style={styles.btnEstrela}
                    onPress={() => dispatch(alternarPrioridadeContato(ct.id))}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={ct.prioridade ? 'star' : 'star-outline'}
                      size={22}
                      color={ct.prioridade ? '#F59E0B' : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.contatoFooter}>
                  <Text style={styles.contatoTelefone}>{ct.telefone}</Text>

                  <View style={styles.contatoBotoes}>
                    <TouchableOpacity
                      style={styles.btnLigarContato}
                      onPress={() => handleLigar(ct.telefone, ct.nome)}
                    >
                      <Ionicons name="call" size={15} color="#FFFFFF" />
                      <Text style={styles.txtLigarContato}>Ligar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnExcluirContato}
                      onPress={() => handleExcluirContato(ct.id, ct.nome)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modais de Ação */}
      <NovaOcorrenciaModal
        visivel={modalNovaOcorrencia}
        aoFechar={() => setModalNovaOcorrencia(false)}
      />

      <NovoContatoModal
        visivel={modalNovoContato}
        aoFechar={() => setModalNovoContato(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tituloSecaoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  escudoContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  topBarTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  badgeCripto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  pontoVerde: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  topBarSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  btnDisfarceImediato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  txtDisfarceImediato: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  abasContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  abaBotao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  abaBotaoAtiva: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
  },
  abaTexto: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  abaTextoAtiva: {
    color: '#DDD6FE',
    fontWeight: '700',
  },
  conteudo: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  metricasContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  cardMetrica: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  numMetrica: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  legendaMetrica: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  btnRegistrarOcorrencia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  txtRegistrarOcorrencia: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  listaOcorrencias: {
    gap: 14,
  },
  vazioCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  vazioTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 12,
  },
  vazioSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  cardOcorrencia: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  cardOcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeViolencia: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  txtBadgeViolencia: {
    color: '#DDD6FE',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeRisco: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  pontoRisco: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  txtBadgeRisco: {
    fontSize: 11,
    fontWeight: '700',
  },
  linhaInfoOc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  txtInfoOc: {
    fontSize: 12,
    color: '#94A3B8',
  },
  separadorDot: {
    color: '#64748B',
  },
  relatoTexto: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    marginBottom: 12,
  },
  evidenciasContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  evidenciasTitulo: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  itemEvidencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  itemEvidenciaNome: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
  },
  itemEvidenciaData: {
    fontSize: 11,
    color: '#64748B',
  },
  cardOcFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  btnExcluirOc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  txtExcluirOc: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  bannerEmergencia: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  bannerEmergenciaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  bannerEmergenciaTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F87171',
  },
  bannerEmergenciaSub: {
    fontSize: 12,
    color: '#FCA5A5',
    marginTop: 2,
    lineHeight: 16,
  },
  bannerBotoesRapidos: {
    flexDirection: 'row',
    gap: 10,
  },
  btnLigarRapido: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  txtLigarRapido: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  secaoHeaderContainer: {
    marginBottom: 12,
  },
  secaoHeaderTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  cardServico: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  servicoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  servicoNome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  servicoTipo: {
    fontSize: 12,
    color: '#A78BFA',
    marginTop: 2,
  },
  badge24h: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  txt24h: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
  },
  servicoDescricao: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 10,
  },
  servicoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  servicoTextoLinha: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  servicoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  servicoTelefoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  servicoTelefone: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DDD6FE',
  },
  btnLigarServico: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  txtLigarServico: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  bannerGuardioes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  bannerGuardioesTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBBF24',
  },
  bannerGuardioesSub: {
    fontSize: 12,
    color: '#FDE68A',
    marginTop: 2,
    lineHeight: 16,
  },
  btnAdicionarGuardião: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  txtAdicionarGuardião: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  cardContato: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  cardContatoPrioritario: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  contatoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contatoAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contatoAvatarLetra: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  contatoNomeLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  contatoNome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  badgePrioridade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  txtBadgePrioridade: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  contatoParentesco: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  btnEstrela: {
    padding: 6,
  },
  contatoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  contatoTelefone: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  contatoBotoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnLigarContato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  txtLigarContato: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  btnExcluirContato: {
    padding: 6,
  },
});
