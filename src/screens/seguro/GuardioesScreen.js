import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { alternarPrioridadeGuardiao, excluirGuardiao } from '../../store';
import { alertar } from '../../utils/alerta';
import { ligar } from '../../utils/telefone';
import AvisoRede from '../../components/AvisoRede';
import estilos from './estilos';

// Aba "Guardiões": contatos de confiança gravados no banco (via API).
export default function GuardioesScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const guardioes = useSelector((state) => state.ocorrencias.guardioes);

  const remover = (id, nome) =>
    alertar('Remover guardião', `Deseja remover "${nome}" da sua rede de confiança?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => dispatch(excluirGuardiao(id)) },
    ]);

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <AvisoRede />

      <View style={estilos.tituloLinha}>
        <Text style={estilos.titulo}>Guardiões ({guardioes.length})</Text>
        <TouchableOpacity style={estilos.botaoPequeno} onPress={() => router.push('/guardioes/novo')} activeOpacity={0.85}>
          <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
          <Text style={estilos.botaoPequenoTexto}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {guardioes.length === 0 ? (
        <View style={estilos.vazio}>
          <Ionicons name="people-outline" size={34} color="#64748B" />
          <Text style={estilos.vazioTitulo}>Nenhum guardião cadastrado</Text>
          <Text style={estilos.vazioSub}>Cadastre pessoas de confiança para ligar rapidamente.</Text>
        </View>
      ) : (
        guardioes.map((g) => (
          <View key={g.id} style={[estilos.card, styles.linha, g.prioridade && styles.prioritario]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetra}>{g.nome.charAt(0).toUpperCase()}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{g.nome}</Text>
              <Text style={estilos.textoFraco}>{[g.parentesco, g.telefone].filter(Boolean).join(' · ')}</Text>
            </View>

            <TouchableOpacity
              onPress={() => dispatch(alternarPrioridadeGuardiao(g.id))}
              hitSlop={8}
              style={styles.icone}
              accessibilityLabel={g.prioridade ? 'Remover prioridade' : 'Marcar como chamar primeiro'}
            >
              <Ionicons name={g.prioridade ? 'star' : 'star-outline'} size={20} color={g.prioridade ? '#F59E0B' : '#64748B'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => ligar(g.telefone)}
              hitSlop={8}
              style={styles.ligar}
              accessibilityLabel={`Ligar para ${g.nome}`}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => remover(g.id, g.nome)} hitSlop={8} style={styles.icone} accessibilityLabel={`Remover ${g.nome}`}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  prioritario: { borderColor: '#F59E0B' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  avatarLetra: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  nome: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  icone: { padding: 6 },
  ligar: { backgroundColor: '#10B981', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
