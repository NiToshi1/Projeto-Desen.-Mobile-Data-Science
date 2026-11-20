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
} from 'react-native';
import { alertar } from '../../utils/alerta';
import { useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { salvarOcorrencia } from '../../store/ocorrenciasSlice';
import BotaoSaidaRapida from '../../components/BotaoSaidaRapida';
import { NIVEIS_PERIGO, corDoPerigo, rotuloDoPerigo } from '../../utils/perigo';

// Registro de uma ocorrência: nível de perigo de 1 a 10 + relato.
// A data e a hora são gravadas automaticamente no momento do registro.
export default function NovaOcorrenciaModal({ visivel, aoFechar }) {
  const dispatch = useDispatch();

  const [nivelPerigo, setNivelPerigo] = useState(null);
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    if (!nivelPerigo) {
      alertar('Nível de perigo', 'Escolha de 1 a 10 o quanto você está em perigo.');
      return;
    }
    if (salvando) return;

    setSalvando(true);
    try {
      await dispatch(
        salvarOcorrencia({
          nivel_perigo: nivelPerigo,
          local: local.trim(),
          descricao: descricao.trim(),
        })
      ).unwrap();
    } catch (e) {
      alertar('Não foi possível salvar', e.message);
      setSalvando(false);
      return;
    }
    setSalvando(false);
    setNivelPerigo(null);
    setLocal('');
    setDescricao('');
    aoFechar();
  };

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={aoFechar} hitSlop={10} style={styles.botaoFechar}>
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Registrar Ocorrência</Text>
          <View style={styles.acoesHeader}>
            <BotaoSaidaRapida />
            <TouchableOpacity
              onPress={handleSalvar}
              style={[styles.botaoSalvar, salvando && { opacity: 0.6 }]}
              disabled={salvando}
            >
              <Text style={styles.textoSalvar}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.secao}>
            <Text style={styles.label}>Nível de perigo (1 a 10)</Text>
            <View style={styles.niveisGrid}>
              {NIVEIS_PERIGO.map((nivel) => {
                const cor = corDoPerigo(nivel);
                const selecionado = nivelPerigo === nivel;
                return (
                  <TouchableOpacity
                    key={nivel}
                    style={[
                      styles.botaoNivel,
                      { borderColor: cor },
                      selecionado && { backgroundColor: cor },
                    ]}
                    onPress={() => setNivelPerigo(nivel)}
                    accessibilityRole="button"
                    accessibilityLabel={`Perigo ${nivel}`}
                  >
                    <Text style={[styles.textoNivel, { color: selecionado ? '#FFFFFF' : cor }]}>
                      {nivel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.legendaNivel}>
              {nivelPerigo
                ? `${nivelPerigo}/10 · ${rotuloDoPerigo(nivelPerigo)}`
                : '1 = situação tranquila · 10 = risco extremo'}
            </Text>
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>Local (opcional)</Text>
            <TextInput
              style={styles.input}
              value={local}
              onChangeText={setLocal}
              placeholder="Ex: em casa, no trabalho, na rua"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.secao}>
            <Text style={styles.label}>O que aconteceu (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Conte com suas palavras..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={5}
            />
          </View>

          <View style={{ height: 40 }} />
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
  botaoSalvar: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  textoSalvar: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  conteudo: { flex: 1, paddingHorizontal: 18, paddingTop: 20 },
  secao: { marginBottom: 22 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  niveisGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  botaoNivel: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoNivel: { fontSize: 18, fontWeight: '800' },
  legendaNivel: { color: '#94A3B8', fontSize: 12, marginTop: 10 },
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
  textArea: { minHeight: 110, textAlignVertical: 'top' },
});
