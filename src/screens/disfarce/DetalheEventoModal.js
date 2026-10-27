import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { removerEvento } from '../../store/agendaSlice';

export default function DetalheEventoModal({ evento, visivel, aoFechar }) {
  const dispatch = useDispatch();

  if (!evento) return null;

  const handleExcluir = () => {
    Alert.alert(
      'Excluir evento',
      `Deseja realmente remover o compromisso "${evento.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            dispatch(removerEvento(evento.id));
            aoFechar();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={aoFechar} hitSlop={10} style={styles.botaoAcao}>
            <Ionicons name="close" size={24} color="#3C4043" />
          </TouchableOpacity>
          <View style={styles.headerAcoesDireita}>
            <TouchableOpacity onPress={handleExcluir} hitSlop={10} style={styles.botaoAcao}>
              <Ionicons name="trash-outline" size={22} color="#D93025" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
          {/* Faixa colorida da categoria */}
          <View style={[styles.barraCor, { backgroundColor: evento.cor || '#1A73E8' }]} />

          {/* Título */}
          <Text style={styles.titulo}>{evento.titulo}</Text>

          {/* Horário */}
          <View style={styles.linhaInfo}>
            <Ionicons name="time-outline" size={20} color="#5F6368" style={styles.icone} />
            <View>
              <Text style={styles.textoPrincipal}>
                {evento.data} · {evento.horaInicio} às {evento.horaFim}
              </Text>
              <Text style={styles.textoSecundario}>Fuso horário padrão (Brasília)</Text>
            </View>
          </View>

          {/* Local */}
          {evento.local ? (
            <View style={styles.linhaInfo}>
              <Ionicons name="location-outline" size={20} color="#5F6368" style={styles.icone} />
              <View>
                <Text style={styles.textoPrincipal}>{evento.local}</Text>
              </View>
            </View>
          ) : null}

          {/* Categoria */}
          <View style={styles.linhaInfo}>
            <Ionicons name="folder-outline" size={20} color="#5F6368" style={styles.icone} />
            <View>
              <Text style={[styles.badgeCategoria, { color: evento.cor || '#1A73E8' }]}>
                {evento.categoria || 'Geral'}
              </Text>
            </View>
          </View>

          {/* Descrição */}
          {evento.descricao ? (
            <View style={styles.linhaInfo}>
              <Ionicons name="reorder-four-outline" size={20} color="#5F6368" style={styles.icone} />
              <View style={styles.descricaoCard}>
                <Text style={styles.textoDescricao}>{evento.descricao}</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  botaoAcao: {
    padding: 6,
    borderRadius: 20,
  },
  headerAcoesDireita: {
    flexDirection: 'row',
    gap: 12,
  },
  conteudo: {
    flex: 1,
    padding: 20,
  },
  barraCor: {
    height: 4,
    width: 48,
    borderRadius: 2,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 24,
    lineHeight: 28,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  icone: {
    marginRight: 16,
    marginTop: 2,
  },
  textoPrincipal: {
    fontSize: 15,
    fontWeight: '500',
    color: '#202124',
  },
  textoSecundario: {
    fontSize: 12,
    color: '#5F6368',
    marginTop: 2,
  },
  badgeCategoria: {
    fontSize: 14,
    fontWeight: '700',
  },
  descricaoCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  textoDescricao: {
    fontSize: 14,
    color: '#3C4043',
    lineHeight: 20,
  },
});
