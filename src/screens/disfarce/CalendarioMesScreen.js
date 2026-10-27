import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderGoogleCalendar from '../../components/HeaderGoogleCalendar';

// ============================================================
// Tela 1: Calendário · Visualização Mês (Disfarce)
// Reproduz fielmente a grade de mês do Google Calendar.
// Mostra dias da semana (D S T Q Q S S), os 31 dias de Outubro,
// marcadores coloridos nos dias com eventos e a lista do dia selecionado.
// ============================================================

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function CalendarioMesScreen({ navigation }) {
  const eventos = useSelector((state) => state.agenda.eventos);
  const [diaSelecionado, setDiaSelecionado] = useState(27);

  // Outubro de 2026 começa na Quinta-feira (índice 4 no array D=0, S=1, T=2, Q=3, Q=4)
  const espacosInicio = 4;
  const totalDias = 31;
  const gradeDias = [];

  for (let i = 0; i < espacosInicio; i++) {
    gradeDias.push(null);
  }
  for (let dia = 1; dia <= totalDias; dia++) {
    gradeDias.push(dia);
  }

  // Filtra eventos do dia selecionado
  const dataFormatada = `2026-10-${String(diaSelecionado).padStart(2, '0')}`;
  const eventosDoDia = eventos.filter((ev) => ev.data === dataFormatada);

  // Função auxiliar para verificar se um dia tem eventos
  const temEventoNoDia = (dia) => {
    if (!dia) return false;
    const dataIso = `2026-10-${String(dia).padStart(2, '0')}`;
    return eventos.some((ev) => ev.data === dataIso);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderGoogleCalendar navigation={navigation} titulo="Outubro de 2026" />

      <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho dos dias da semana */}
        <View style={styles.linhaDiasSemana}>
          {DIAS_SEMANA.map((dia, idx) => (
            <Text key={idx} style={styles.textoDiaSemana}>
              {dia}
            </Text>
          ))}
        </View>

        {/* Grade de dias do mês */}
        <View style={styles.gradeMes}>
          {gradeDias.map((dia, index) => {
            if (!dia) {
              return <View key={index} style={styles.celulaVazia} />;
            }
            const selecionado = dia === diaSelecionado;
            const comEvento = temEventoNoDia(dia);

            return (
              <TouchableOpacity
                key={index}
                style={[styles.celulaDia, selecionado && styles.celulaSelecionada]}
                onPress={() => setDiaSelecionado(dia)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.textoDia,
                    selecionado && styles.textoDiaSelecionado,
                  ]}
                >
                  {dia}
                </Text>
                {comEvento && (
                  <View
                    style={[
                      styles.marcadorEvento,
                      selecionado && styles.marcadorEventoSelecionado,
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Seção de eventos do dia selecionado */}
        <View style={styles.secaoEventos}>
          <View style={styles.secaoTituloContainer}>
            <Text style={styles.secaoTitulo}>
              {diaSelecionado} de Outubro de 2026
            </Text>
            <Text style={styles.secaoContador}>
              {eventosDoDia.length} {eventosDoDia.length === 1 ? 'evento' : 'eventos'}
            </Text>
          </View>

          {eventosDoDia.length === 0 ? (
            <View style={styles.semEventosCard}>
              <Ionicons name="sunny-outline" size={32} color="#9AA0A6" />
              <Text style={styles.semEventosTexto}>Nenhum evento agendado para este dia</Text>
              <Text style={styles.semEventosSub}>Toque no botão + para criar um novo compromisso</Text>
            </View>
          ) : (
            eventosDoDia.map((evento) => (
              <TouchableOpacity
                key={evento.id}
                style={[styles.cartaoEvento, { borderLeftColor: evento.cor || '#1A73E8' }]}
                onPress={() => navigation.navigate('DetalheEvento', { evento })}
                activeOpacity={0.8}
              >
                <View style={styles.eventoInfo}>
                  <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
                  <View style={styles.eventoLinha}>
                    <Ionicons name="time-outline" size={14} color="#5F6368" />
                    <Text style={styles.eventoHorario}>
                      {evento.horaInicio} - {evento.horaFim}
                    </Text>
                  </View>
                  {evento.local ? (
                    <View style={styles.eventoLinha}>
                      <Ionicons name="location-outline" size={14} color="#5F6368" />
                      <Text style={styles.eventoLocal} numberOfLines={1}>
                        {evento.local}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.categoriaBadge,
                    { backgroundColor: `${evento.cor || '#1A73E8'}15` },
                  ]}
                >
                  <Text style={[styles.categoriaTexto, { color: evento.cor || '#1A73E8' }]}>
                    {evento.categoria || 'Geral'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Botão Flutuante (FAB) do Google Calendar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NovoEvento')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  conteudo: {
    flex: 1,
  },
  linhaDiasSemana: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  textoDiaSemana: {
    fontSize: 12,
    fontWeight: '600',
    color: '#70757A',
    width: 36,
    textAlign: 'center',
  },
  gradeMes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  celulaVazia: {
    width: `${100 / 7}%`,
    height: 44,
  },
  celulaDia: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginVertical: 2,
  },
  celulaSelecionada: {
    backgroundColor: '#1A73E8',
  },
  textoDia: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C4043',
  },
  textoDiaSelecionado: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  marcadorEvento: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1A73E8',
    marginTop: 2,
  },
  marcadorEventoSelecionado: {
    backgroundColor: '#FFFFFF',
  },
  secaoEventos: {
    padding: 16,
    paddingBottom: 90,
  },
  secaoTituloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  secaoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#202124',
  },
  secaoContador: {
    fontSize: 12,
    color: '#70757A',
  },
  semEventosCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginTop: 6,
  },
  semEventosTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C4043',
    marginTop: 10,
  },
  semEventosSub: {
    fontSize: 12,
    color: '#70757A',
    marginTop: 4,
    textAlign: 'center',
  },
  cartaoEvento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E8EAED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventoInfo: {
    flex: 1,
    gap: 4,
  },
  eventoTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#202124',
  },
  eventoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventoHorario: {
    fontSize: 13,
    color: '#5F6368',
  },
  eventoLocal: {
    fontSize: 12,
    color: '#70757A',
  },
  categoriaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  categoriaTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
