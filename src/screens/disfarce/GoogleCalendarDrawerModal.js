import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CATEGORIAS, VISUALIZACOES } from '../../constants/agenda';

export default function GoogleCalendarDrawerModal({
  visivel,
  aoFechar,
  aoAbrirConfiguracoes,
  aoSelecionarVisualizacao,
  visualizacaoAtual = 'Mês',
  categoriasOcultas = [],
  aoAlternarCategoria,
}) {
  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={aoFechar}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={aoFechar}>
          <View style={styles.fundoBackdrop} />
        </TouchableWithoutFeedback>

        <SafeAreaView style={styles.drawerContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Cabeçalho do Drawer */}
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <Ionicons name="calendar" size={26} color="#1A73E8" />
                <Text style={styles.logoTexto}>Google Agenda</Text>
              </View>
            </View>

            <View style={styles.divisor} />

            {/* Visualizações da Agenda */}
            <View style={styles.secao}>
              {VISUALIZACOES.map((item) => {
                const ativo = visualizacaoAtual === item.nome;
                return (
                  <TouchableOpacity
                    key={item.nome}
                    style={[styles.itemMenu, ativo && styles.itemMenuAtivo]}
                    onPress={() => {
                      aoSelecionarVisualizacao?.(item.nome);
                      aoFechar();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icone}
                      size={20}
                      color={ativo ? '#1A73E8' : '#3C4043'}
                      style={styles.itemIcone}
                    />
                    <Text
                      style={[
                        styles.itemTexto,
                        ativo && styles.itemTextoAtivo,
                      ]}
                    >
                      {item.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divisor} />

            {/* Minhas Agendas */}
            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Minhas Agendas</Text>
              {CATEGORIAS.map((agenda) => {
                const visivelNaAgenda = !categoriasOcultas.includes(agenda.categoria);
                return (
                  <TouchableOpacity
                    key={agenda.categoria}
                    style={styles.itemAgenda}
                    onPress={() => aoAlternarCategoria?.(agenda.categoria)}
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: visivelNaAgenda }}
                  >
                    <View
                      style={[
                        styles.checkboxAgenda,
                        {
                          borderColor: agenda.cor,
                          backgroundColor: visivelNaAgenda ? agenda.cor : 'transparent',
                        },
                      ]}
                    >
                      {visivelNaAgenda && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.itemAgendaTexto}>{agenda.categoria}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divisor} />

            {/* Ações inferiores / Configurações */}
            <View style={styles.secao}>
              <TouchableOpacity
                style={styles.itemMenu}
                onPress={() => {
                  aoFechar();
                  aoAbrirConfiguracoes();
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color="#3C4043"
                  style={styles.itemIcone}
                />
                <Text style={styles.itemTexto}>Configurações</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.itemMenu}
                onPress={aoFechar}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#3C4043"
                  style={styles.itemIcone}
                />
                <Text style={styles.itemTexto}>Ajuda e feedback</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  fundoBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawerContainer: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoTexto: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3C4043',
    letterSpacing: -0.2,
  },
  divisor: {
    height: 1,
    backgroundColor: '#E8EAED',
    marginVertical: 4,
  },
  secao: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  secaoTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#70757A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  itemMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginVertical: 2,
  },
  itemMenuAtivo: {
    backgroundColor: '#E8F0FE',
  },
  itemIcone: {
    marginRight: 16,
  },
  itemTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C4043',
  },
  itemTextoAtivo: {
    color: '#1A73E8',
    fontWeight: '700',
  },
  itemAgenda: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  checkboxAgenda: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemAgendaTexto: {
    fontSize: 13,
    color: '#3C4043',
  },
});
