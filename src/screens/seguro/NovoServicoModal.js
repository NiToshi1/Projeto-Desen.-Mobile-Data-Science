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
} from 'react-native';
import { alertar } from '../../utils/alerta';
import { useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { salvarServico } from '../../store/ocorrenciasSlice';
import BotaoSaidaRapida from '../../components/BotaoSaidaRapida';

// Cadastro de um serviço de apoio (Create do CRUD de Serviços).
export default function NovoServicoModal({ visivel, aoFechar }) {
  const dispatch = useDispatch();

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [atendimento24h, setAtendimento24h] = useState(false);

  const handleSalvar = async () => {
    if (!nome.trim() || !telefone.trim()) {
      alertar('Dados incompletos', 'Informe pelo menos o nome e o telefone do serviço.');
      return;
    }

    const novoServico = {
      nome: nome.trim(),
      tipo: tipo.trim() || 'Serviço de apoio',
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      descricao: descricao.trim(),
      atendimento_24h: atendimento24h,
    };

    try {
      await dispatch(salvarServico(novoServico)).unwrap();
    } catch (e) {
      alertar('Não foi possível salvar', e.message);
      return;
    }
    setNome('');
    setTipo('');
    setTelefone('');
    setEndereco('');
    setDescricao('');
    setAtendimento24h(false);
    aoFechar();
  };

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={aoFechar} hitSlop={10} style={styles.botaoFechar}>
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Novo Serviço de Apoio</Text>
          <View style={styles.acoesHeader}>
            <BotaoSaidaRapida />
            <TouchableOpacity onPress={handleSalvar} style={styles.botaoSalvar}>
              <Text style={styles.textoSalvar}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
          <View style={styles.secao}>
            <Text style={styles.label}>Nome do serviço</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Casa da Mulher Brasileira"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Tipo de atendimento</Text>
            <TextInput
              style={styles.input}
              value={tipo}
              onChangeText={setTipo}
              placeholder="Ex: Acolhimento psicológico e jurídico"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(43) 3333-3333"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Rua, número, bairro, cidade"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinha]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="O que o serviço oferece"
              placeholderTextColor="#64748B"
              multiline
            />
          </View>

          <View style={styles.cardSwitch}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.tituloSwitch}>Atendimento 24 horas</Text>
              <Text style={styles.subSwitch}>Marque se o serviço atende a qualquer hora do dia ou da noite.</Text>
            </View>
            <Switch
              value={atendimento24h}
              onValueChange={setAtendimento24h}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor={atendimento24h ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  botaoFechar: { padding: 8 },
  headerTitulo: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  acoesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botaoSalvar: { backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  textoSalvar: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  conteudo: { flex: 1, padding: 20 },
  secao: { marginBottom: 20 },
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
  inputMultilinha: { minHeight: 90, textAlignVertical: 'top' },
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
  tituloSwitch: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  subSwitch: { fontSize: 12, color: '#94A3B8', marginTop: 4, lineHeight: 16 },
});
