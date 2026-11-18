import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { sairEspacoSeguro } from '../store/authSlice';

// ============================================================
// Saída rápida (quick exit) para telas cobertas por modais.
// Um único toque, SEM confirmação: qualquer "Tem certeza?" atrasaria
// a saída, que é justamente o que este botão existe para evitar.
// Troca o app inteiro de volta para o disfarce (Google Calendar) e a
// store apaga os dados sensíveis da memória.
// ============================================================
export default function BotaoSaidaRapida() {
  const dispatch = useDispatch();
  return (
    <TouchableOpacity
      style={styles.botao}
      onPress={() => dispatch(sairEspacoSeguro())}
      hitSlop={10}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Saída rápida"
    >
      <Ionicons name="eye-off-outline" size={18} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#DC2626',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
