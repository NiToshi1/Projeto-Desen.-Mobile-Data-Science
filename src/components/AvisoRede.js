import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { carregarEspacoSeguro, limparErro } from '../store';

// Faixa "Sincronizando..." / erro com "Tentar novamente" do Espaço Seguro.
export default function AvisoRede() {
  const dispatch = useDispatch();
  const carregando = useSelector((state) => state.ocorrencias.carregando);
  const erro = useSelector((state) => state.ocorrencias.erro);

  if (carregando) {
    return (
      <View style={styles.faixa}>
        <ActivityIndicator size="small" color="#A78BFA" />
        <Text style={styles.texto}>Sincronizando...</Text>
      </View>
    );
  }
  if (!erro) return null;
  return (
    <View style={[styles.faixa, styles.erro]}>
      <Ionicons name="cloud-offline-outline" size={18} color="#EF4444" />
      <Text style={[styles.texto, { flex: 1 }]}>{erro}</Text>
      <TouchableOpacity
        onPress={() => {
          dispatch(limparErro());
          dispatch(carregarEspacoSeguro());
        }}
      >
        <Text style={styles.tentar}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  faixa: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1E293B', borderRadius: 10, padding: 12, marginBottom: 12 },
  erro: { borderWidth: 1, borderColor: '#7F1D1D' },
  texto: { color: '#CBD5E1', fontSize: 13 },
  tentar: { color: '#A78BFA', fontSize: 13, fontWeight: '700' },
});
