import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { adicionarContato } from '../../store/ocorrenciasSlice';

export default function NovoContatoModal({ visivel, aoFechar }) {
  const dispatch = useDispatch();

  const [nome, setNome] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [prioridade, setPrioridade] = useState(false);

  const handleSalvar = () => {
    if (!nome.trim() || !telefone.trim()) {
      Alert.alert('Dados incompletos', 'Informe pelo menos o nome e telefone do contato.');
      return;
    }

    const novoContato = {
      id: `ct-${Date.now()}`,
      nome: nome.trim(),
      parentesco: parentesco.trim() || 'Apoio de Confiança',
      telefone: telefone.trim(),
      contato_confianca: true,
      prioridade,
    };

    dispatch(adicionarContato(novoContato));
    setNome('');
    setParentesco('');
    setTelefone('');
    setPrioridade(false);
    aoFechar();
  };

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={aoFechar} hitSlop={10} style={styles.botaoFechar}>
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Novo Guardião de Confiança</Text>
          <TouchableOpacity onPress={handleSalvar} style={styles.botaoSalvar}>
            <Text style={styles.textoSalvar}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
          <View style={styles.secao}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Dra. Mariana, Irmã Patrícia..."
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Vínculo ou Parentesco</Text>
            <TextInput
              style={styles.input}
              value={parentesco}
              onChangeText={setParentesco}
              placeholder="Ex: Irmã, Advogada, Amiga de infância..."
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Telefone com DDD</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(43) 99999-9999"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.cardSwitch}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.tituloSwitch}>Prioridade Máxima (Chamar Primeiro)</Text>
              <Text style={styles.subSwitch}>
                Esse contato receberá alerta e chamada prioritária em caso de acionamento de emergência.
              </Text>
            </View>
            <Switch
              value={prioridade}
              onValueChange={setPrioridade}
              trackColor={{ false: '#334155', true: '#F59E0B' }}
              thumbColor={prioridade ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  botaoFechar: {
    padding: 8,
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  botaoSalvar: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoSalvar: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  conteudo: {
    flex: 1,
    padding: 20,
  },
  secao: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#F8FAFC',
  },
  cardSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  tituloSwitch: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subSwitch: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
});
