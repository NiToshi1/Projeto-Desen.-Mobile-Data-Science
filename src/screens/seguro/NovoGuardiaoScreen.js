import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { salvarGuardiao } from '../../store';
import { alertar } from '../../utils/alerta';
import estilos from './estilos';

// Cadastro de um guardião (contato de confiança), gravado no banco pela API.
export default function NovoGuardiaoScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [nome, setNome] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [prioridade, setPrioridade] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (!nome.trim() || !telefone.trim()) {
      alertar('Dados incompletos', 'Informe pelo menos o nome e o telefone do guardião.');
      return;
    }
    setSalvando(true);
    try {
      await dispatch(
        salvarGuardiao({
          nome: nome.trim(),
          parentesco: parentesco.trim() || 'Apoio de confiança',
          telefone: telefone.trim(),
          prioridade,
        })
      ).unwrap();
      router.back();
    } catch (e) {
      alertar('Não foi possível salvar', e.message);
      setSalvando(false);
    }
  };

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <View style={estilos.campo}>
        <Text style={estilos.label}>Nome</Text>
        <TextInput style={estilos.input} value={nome} onChangeText={setNome} placeholder="Ex: Mariana Vaz" placeholderTextColor="#64748B" />
      </View>

      <View style={estilos.campo}>
        <Text style={estilos.label}>Vínculo ou parentesco</Text>
        <TextInput
          style={estilos.input}
          value={parentesco}
          onChangeText={setParentesco}
          placeholder="Ex: irmã, advogada, amiga"
          placeholderTextColor="#64748B"
        />
      </View>

      <View style={estilos.campo}>
        <Text style={estilos.label}>Telefone</Text>
        <TextInput
          style={estilos.input}
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(43) 99999-9999"
          placeholderTextColor="#64748B"
          keyboardType="phone-pad"
        />
      </View>

      <View style={[estilos.card, styles.linhaSwitch]}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.switchTitulo}>Chamar primeiro</Text>
          <Text style={estilos.textoFraco}>Só um guardião pode ser o primeiro da lista.</Text>
        </View>
        <Switch
          value={prioridade}
          onValueChange={setPrioridade}
          trackColor={{ false: '#334155', true: '#F59E0B' }}
          thumbColor={prioridade ? '#FFFFFF' : '#94A3B8'}
        />
      </View>

      <TouchableOpacity style={[estilos.botao, salvando && { opacity: 0.6 }]} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
        <Text style={estilos.botaoTexto}>{salvando ? 'Salvando...' : 'Salvar guardião'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  linhaSwitch: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  switchTitulo: { color: '#F8FAFC', fontSize: 14, fontWeight: '700' },
});
