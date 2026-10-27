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
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { adicionarOcorrencia } from '../../store/ocorrenciasSlice';

const TIPOS_VIOLENCIA = [
  'Psicológica',
  'Física',
  'Patrimonial',
  'Moral',
  'Sexual',
];

const NIVEIS_RISCO = [
  { nivel: 1, rotulo: '1 - Leve', cor: '#10B981' },
  { nivel: 2, rotulo: '2 - Moderado', cor: '#3B82F6' },
  { nivel: 3, rotulo: '3 - Alto', cor: '#F59E0B' },
  { nivel: 4, rotulo: '4 - Severo', cor: '#F97316' },
  { nivel: 5, rotulo: '5 - Crítico', cor: '#EF4444' },
];

export default function NovaOcorrenciaModal({ visivel, aoFechar }) {
  const dispatch = useDispatch();

  const [tipoViolencia, setTipoViolencia] = useState(TIPOS_VIOLENCIA[0]);
  const [dataOcorrencia, setDataOcorrencia] = useState('2026-10-27 10:00');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nivelRisco, setNivelRisco] = useState(3);
  const [nomeEvidencia, setNomeEvidencia] = useState('');
  const [tipoEvidencia, setTipoEvidencia] = useState('audio');

  const handleSalvar = () => {
    if (!descricao.trim()) {
      Alert.alert('Descrição necessária', 'Descreva o que ocorreu para manter o registro seguro.');
      return;
    }

    const evidencias = [];
    if (nomeEvidencia.trim()) {
      evidencias.push({
        id: `ev-${Date.now()}`,
        tipo: tipoEvidencia,
        nome: nomeEvidencia.trim(),
        descricao: 'Evidência anexada no momento do registro confidencial.',
        data_upload: '27/10/2026',
      });
    }

    const novaOcorrencia = {
      id: `oc-${Date.now()}`,
      data_ocorrencia: dataOcorrencia.trim(),
      tipo_violencia: tipoViolencia,
      local: local.trim() || 'Não informado',
      descricao: descricao.trim(),
      nivel_risco: nivelRisco,
      evidencias,
      encaminhamentos: [],
    };

    dispatch(adicionarOcorrencia(novaOcorrencia));
    // Reset
    setLocal('');
    setDescricao('');
    setNomeEvidencia('');
    setNivelRisco(3);
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
          <Text style={styles.headerTitulo}>Registrar Ocorrência</Text>
          <TouchableOpacity onPress={handleSalvar} style={styles.botaoSalvar}>
            <Text style={styles.textoSalvar}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
          {/* Aviso de Confidencialidade */}
          <View style={styles.avisoSeguranca}>
            <Ionicons name="lock-closed" size={18} color="#A78BFA" />
            <Text style={styles.avisoTexto}>
              Registro estritamente criptografado e salvo com segurança em seu dispositivo.
            </Text>
          </View>

          {/* Tipo de Violência */}
          <View style={styles.secao}>
            <Text style={styles.label}>Tipo de Violência</Text>
            <View style={styles.chipsContainer}>
              {TIPOS_VIOLENCIA.map((tipo) => {
                const ativo = tipoViolencia === tipo;
                return (
                  <TouchableOpacity
                    key={tipo}
                    style={[styles.chipTipo, ativo && styles.chipTipoAtivo]}
                    onPress={() => setTipoViolencia(tipo)}
                  >
                    <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Nível de Risco (1 a 5) */}
          <View style={styles.secao}>
            <Text style={styles.label}>Nível de Gravidade / Risco</Text>
            <View style={styles.niveisGrid}>
              {NIVEIS_RISCO.map((item) => {
                const selecionado = nivelRisco === item.nivel;
                return (
                  <TouchableOpacity
                    key={item.nivel}
                    style={[
                      styles.botaoNivel,
                      { borderColor: item.cor },
                      selecionado && { backgroundColor: item.cor },
                    ]}
                    onPress={() => setNivelRisco(item.nivel)}
                  >
                    <Text
                      style={[
                        styles.textoNivel,
                        { color: selecionado ? '#FFFFFF' : item.cor },
                      ]}
                    >
                      {item.rotulo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Data e Horário */}
          <View style={styles.secao}>
            <Text style={styles.label}>Data e Hora do Acontecido</Text>
            <TextInput
              style={styles.input}
              value={dataOcorrencia}
              onChangeText={setDataOcorrencia}
              placeholder="AAAA-MM-DD HH:MM"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Local */}
          <View style={styles.secao}>
            <Text style={styles.label}>Local do Fato</Text>
            <TextInput
              style={styles.input}
              value={local}
              onChangeText={setLocal}
              placeholder="Ex: Residência, local de trabalho, via pública"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Relato / Descrição */}
          <View style={styles.secao}>
            <Text style={styles.label}>Descrição Detalhada do Fato</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Relate com suas palavras o que aconteceu, o que foi dito ou realizado..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={5}
            />
          </View>

          {/* Anexar Evidência */}
          <View style={styles.secao}>
            <Text style={styles.label}>Anexar Evidência (Opcional)</Text>
            <View style={styles.tipoEvidenciaLinha}>
              {[
                { id: 'audio', nome: 'Áudio gravado', icone: 'mic-outline' },
                { id: 'foto', nome: 'Foto / Print', icone: 'image-outline' },
                { id: 'doc', nome: 'Documento', icone: 'document-text-outline' },
              ].map((ev) => {
                const ativo = tipoEvidencia === ev.id;
                return (
                  <TouchableOpacity
                    key={ev.id}
                    style={[styles.btnTipoEv, ativo && styles.btnTipoEvAtivo]}
                    onPress={() => setTipoEvidencia(ev.id)}
                  >
                    <Ionicons
                      name={ev.icone}
                      size={18}
                      color={ativo ? '#A78BFA' : '#94A3B8'}
                    />
                    <Text style={[styles.txtTipoEv, ativo && styles.txtTipoEvAtivo]}>
                      {ev.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              value={nomeEvidencia}
              onChangeText={setNomeEvidencia}
              placeholder="Nome ou descrição do arquivo de prova"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={{ height: 40 }} />
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
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  avisoSeguranca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 12,
    color: '#DDD6FE',
    lineHeight: 18,
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipTipo: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipTipoAtivo: {
    backgroundColor: '#7C3AED',
    borderColor: '#A78BFA',
  },
  chipTexto: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  chipTextoAtivo: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  niveisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  botaoNivel: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: '#1E293B',
  },
  textoNivel: {
    fontSize: 12,
    fontWeight: '700',
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
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  tipoEvidenciaLinha: {
    flexDirection: 'row',
    gap: 8,
  },
  btnTipoEv: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnTipoEvAtivo: {
    borderColor: '#A78BFA',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  txtTipoEv: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  txtTipoEvAtivo: {
    color: '#DDD6FE',
  },
});
