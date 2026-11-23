import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { VISUALIZACOES } from '../../constants/agenda';
import { definirVisualizacao } from '../../store/agendaSlice';

// Conteúdo do Drawer da agenda (drawerContent): visualizações (Semana e Mês)
// e Configurações (por onde se chega ao PIN do Espaço Seguro).
export default function MenuAgenda({ navigation }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const visualizacao = useSelector((state) => state.agenda.visualizacao);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="calendar" size={26} color="#1A73E8" />
          <Text style={styles.logoTexto}>Google Agenda</Text>
        </View>

        <View style={styles.divisor} />

        <View style={styles.secao}>
          {VISUALIZACOES.map((item) => {
            const ativo = visualizacao === item.nome;
            return (
              <TouchableOpacity
                key={item.nome}
                style={[styles.itemMenu, ativo && styles.itemMenuAtivo]}
                onPress={() => {
                  dispatch(definirVisualizacao(item.nome));
                  router.navigate('/');
                  navigation.closeDrawer();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icone} size={20} color={ativo ? '#1A73E8' : '#3C4043'} style={styles.itemIcone} />
                <Text style={[styles.itemTexto, ativo && styles.itemTextoAtivo]}>{item.nome}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.divisor} />

        <View style={styles.secao}>
          <TouchableOpacity
            style={styles.itemMenu}
            onPress={() => {
              router.navigate('/configuracoes');
              navigation.closeDrawer();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color="#3C4043" style={styles.itemIcone} />
            <Text style={styles.itemTexto}>Configurações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 18 },
  logoTexto: { fontSize: 20, fontWeight: '600', color: '#3C4043', letterSpacing: -0.2 },
  divisor: { height: 1, backgroundColor: '#E8EAED', marginVertical: 4 },
  secao: { paddingVertical: 8, paddingHorizontal: 10 },
  itemMenu: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 24, marginVertical: 2 },
  itemMenuAtivo: { backgroundColor: '#E8F0FE' },
  itemIcone: { marginRight: 16 },
  itemTexto: { fontSize: 14, fontWeight: '500', color: '#3C4043' },
  itemTextoAtivo: { color: '#1A73E8', fontWeight: '700' },
});
