import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ligar } from '../../utils/telefone';
import { MENSAGEM_PADRAO_SMS, enviarSmsAosGuardioes } from '../../utils/sms';
import AvisoRede from '../../components/AvisoRede';
import estilos from './estilos';

// Aba "Ocorrências": ligar para a polícia (190), registrar nova ocorrência
// e avisar os guardiões por SMS.
export default function OcorrenciasScreen() {
  const router = useRouter();
  const guardioes = useSelector((state) => state.ocorrencias.guardioes);
  const [mensagem, setMensagem] = useState(MENSAGEM_PADRAO_SMS);

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <AvisoRede />

      <TouchableOpacity
        style={styles.btnPolicia}
        onPress={() => ligar('190')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Ligar para a polícia, 190"
      >
        <Ionicons name="call" size={26} color="#FFFFFF" />
        <View>
          <Text style={styles.txtPolicia}>LIGAR PARA A POLÍCIA</Text>
          <Text style={styles.subPolicia}>190 · toque para discar agora</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={estilos.botao} onPress={() => router.push('/ocorrencias/nova')} activeOpacity={0.85}>
        <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
        <Text style={estilos.botaoTexto}>Registrar Nova Ocorrência</Text>
      </TouchableOpacity>

      <Text style={estilos.titulo}>Avisar meus guardiões por SMS</Text>
      <View style={estilos.card}>
        <TextInput
          style={[estilos.input, estilos.textArea, { minHeight: 80 }]}
          value={mensagem}
          onChangeText={setMensagem}
          multiline
          placeholder="Mensagem para os guardiões"
          placeholderTextColor="#64748B"
          accessibilityLabel="Mensagem do SMS"
        />
        <Text style={[estilos.textoFraco, { marginTop: 8 }]}>
          {guardioes.length === 0
            ? 'Nenhum guardião cadastrado. Adicione na aba Guardiões.'
            : `Vai para: ${guardioes.map((g) => g.nome).join(', ')}`}
        </Text>
        <TouchableOpacity
          style={[estilos.botao, { marginTop: 12, marginBottom: 0 }, guardioes.length === 0 && styles.desativado]}
          onPress={() => enviarSmsAosGuardioes(guardioes, mensagem)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Enviar SMS aos guardiões"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
          <Text style={estilos.botaoTexto}>Enviar SMS aos guardiões</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  btnPolicia: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  txtPolicia: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.4 },
  subPolicia: { color: '#FECACA', fontSize: 12, marginTop: 2 },
  desativado: { opacity: 0.5 },
});
