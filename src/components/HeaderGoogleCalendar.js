import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// ============================================================
// Header autêntico estilo Google Calendar:
// - Ícone hambúrguer para abrir o Drawer lateral
// - Título do mês corrente ("Outubro de 2026")
// - Botão de busca
// - Botão "Hoje"
// - Avatar circular da conta do usuário ("F" de Fernando)
// ============================================================

export default function HeaderGoogleCalendar({
  navigation,
  titulo = 'Outubro de 2026',
  aoBuscar,
  aoAbrirMenu,
  aoAbrirPerfil,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.esquerda}>
        <TouchableOpacity
          style={styles.botaoIcone}
          onPress={aoAbrirMenu || (() => navigation?.openDrawer?.())}
          hitSlop={12}
        >
          <Ionicons name="menu" size={26} color="#3C4043" />
        </TouchableOpacity>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>

      <View style={styles.direita}>
        <TouchableOpacity
          style={styles.botaoIcone}
          onPress={aoBuscar || (() => {})}
          hitSlop={8}
        >
          <Ionicons name="search" size={22} color="#5F6368" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoHoje} hitSlop={8}>
          <Ionicons name="calendar-outline" size={20} color="#5F6368" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatar}
          onPress={aoAbrirPerfil || (() => {})}
          hitSlop={8}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarTexto}>F</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  esquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  direita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  botaoIcone: {
    padding: 6,
    borderRadius: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C4043',
    letterSpacing: -0.2,
  },
  botaoHoje: {
    padding: 6,
    borderRadius: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
