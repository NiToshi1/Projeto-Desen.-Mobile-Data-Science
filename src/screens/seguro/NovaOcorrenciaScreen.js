import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { atualizarOcorrencia, salvarOcorrencia } from '../../store';
import { alertar } from '../../utils/alerta';
import { NIVEIS_PERIGO, corDoPerigo, rotuloDoPerigo } from '../../utils/perigo';
import estilos from './estilos';

// Registro (e edição, com ?id=...) de uma ocorrência: nível de perigo (1 a 10), um guardião de
// confiança opcional (relacionamento validado pela API) e o relato.
// A data e a hora são gravadas automaticamente.
export default function NovaOcorrenciaScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const guardioes = useSelector((state) => state.ocorrencias.guardioes);

  const { id } = useLocalSearchParams();
  const existente = useSelector((state) => state.ocorrencias.ocorrencias.find((o) => String(o.id) === String(id)));
  const editando = !!existente;
  const [nivel, setNivel] = useState(existente?.nivel_perigo ?? null);
  const [guardiaoId, setGuardiaoId] = useState(existente?.guardiao_id ?? null);
  const [local, setLocal] = useState(existente?.local ?? '');
  const [descricao, setDescricao] = useState(existente?.descricao ?? '');
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    if (!nivel) {
      alertar('Nível de perigo', 'Escolha de 1 a 10 o quanto você está em perigo.');
      return;
    }
    setSalvando(true);
    try {
      const dados = {
        nivel_perigo: nivel,
        local: local.trim(),
        descricao: descricao.trim(),
        guardiao_id: guardiaoId,
      };
      await dispatch(editando ? atualizarOcorrencia({ id: existente.id, dados }) : salvarOcorrencia(dados)).unwrap();
      alertar(editando ? 'Ocorrência atualizada' : 'Ocorrência registrada', 'Seu registro foi salvo com segurança.');
      router.back();
    } catch (e) {
      alertar('Não foi possível salvar', e.message);
      setSalvando(false);
    }
  };

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: editando ? 'Editar ocorrência' : 'Registrar ocorrência' }} />
      <View style={estilos.campo}>
        <Text style={estilos.label}>Nível de perigo (1 a 10)</Text>
        <View style={estilos.chips}>
          {NIVEIS_PERIGO.map((n) => {
            const cor = corDoPerigo(n);
            const ativo = nivel === n;
            return (
              <TouchableOpacity
                key={n}
                style={[styles.nivel, { borderColor: cor }, ativo && { backgroundColor: cor }]}
                onPress={() => setNivel(n)}
                accessibilityRole="button"
                accessibilityLabel={`Perigo ${n}`}
              >
                <Text style={[styles.nivelTexto, { color: ativo ? '#FFFFFF' : cor }]}>{n}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[estilos.textoFraco, { marginTop: 10 }]}>
          {nivel ? `${nivel}/10 · ${rotuloDoPerigo(nivel)}` : '1 = situação tranquila · 10 = risco extremo'}
        </Text>
      </View>

      <View style={estilos.campo}>
        <Text style={estilos.label}>Guardião que sabe desta ocorrência (opcional)</Text>
        {guardioes.length === 0 ? (
          <Text style={estilos.textoFraco}>Cadastre guardiões na aba Guardiões para poder escolher um aqui.</Text>
        ) : (
          <View style={estilos.chips}>
            {guardioes.map((g) => {
              const ativo = guardiaoId === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[estilos.chip, ativo && estilos.chipAtivo]}
                  onPress={() => setGuardiaoId(ativo ? null : g.id)}
                >
                  <Text style={[estilos.chipTexto, ativo && estilos.chipTextoAtivo]}>{g.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={estilos.campo}>
        <Text style={estilos.label}>Local (opcional)</Text>
        <TextInput
          style={estilos.input}
          value={local}
          onChangeText={setLocal}
          placeholder="Ex: em casa, no trabalho, na rua"
          placeholderTextColor="#64748B"
        />
      </View>

      <View style={estilos.campo}>
        <Text style={estilos.label}>O que aconteceu (opcional)</Text>
        <TextInput
          style={[estilos.input, estilos.textArea]}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Conte com suas palavras..."
          placeholderTextColor="#64748B"
          multiline
        />
      </View>

      <TouchableOpacity style={[estilos.botao, salvando && { opacity: 0.6 }]} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
        <Text style={estilos.botaoTexto}>{salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar ocorrência'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  nivel: { width: 52, height: 52, borderRadius: 12, borderWidth: 2, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  nivelTexto: { fontSize: 18, fontWeight: '800' },
});
