import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { excluirOcorrencia } from '../../store';
import { alertar } from '../../utils/alerta';
import { corDoPerigo, rotuloDoPerigo, formatarDataHora } from '../../utils/perigo';
import estilos from './estilos';

// "Minhas ocorrências": lista (mais recente primeiro), editar e excluir.
// Fica numa tela à parte para a tela principal continuar limpa (190, registrar e SMS).
export default function ListaOcorrenciasScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const ocorrencias = useSelector((state) => state.ocorrencias.ocorrencias);
  const guardioes = useSelector((state) => state.ocorrencias.guardioes);

  const maisRecentesPrimeiro = [...ocorrencias].sort((a, b) =>
    String(b.data_ocorrencia).localeCompare(String(a.data_ocorrencia))
  );

  const excluir = (id) =>
    alertar('Excluir registro', 'Tem certeza de que deseja apagar esta ocorrência?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => dispatch(excluirOcorrencia(id)) },
    ]);

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Ocorrências ({ocorrencias.length})</Text>

      {maisRecentesPrimeiro.length === 0 ? (
        <View style={estilos.vazio}>
          <Ionicons name="shield-outline" size={34} color="#64748B" />
          <Text style={estilos.vazioTitulo}>Nenhum registro no momento</Text>
        </View>
      ) : (
        maisRecentesPrimeiro.map((oc) => {
          const cor = corDoPerigo(oc.nivel_perigo);
          const guardiao = guardioes.find((g) => g.id === oc.guardiao_id);
          return (
            <View key={oc.id} style={estilos.card}>
              <View style={styles.topo}>
                <View style={[styles.selo, { borderColor: cor }]}>
                  <View style={[styles.ponto, { backgroundColor: cor }]} />
                  <Text style={[styles.seloTexto, { color: cor }]}>
                    Perigo {oc.nivel_perigo}/10 · {rotuloDoPerigo(oc.nivel_perigo)}
                  </Text>
                </View>
                <View style={styles.acoes}>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/ocorrencias/nova', params: { id: String(oc.id) } })}
                    hitSlop={10}
                    accessibilityLabel="Editar ocorrência"
                  >
                    <Ionicons name="create-outline" size={20} color="#A78BFA" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => excluir(oc.id)} hitSlop={10} accessibilityLabel="Excluir ocorrência">
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={estilos.textoFraco}>
                {formatarDataHora(oc.data_ocorrencia)}
                {oc.local ? ` · ${oc.local}` : ''}
              </Text>
              {oc.descricao ? <Text style={[estilos.texto, { marginTop: 8 }]}>{oc.descricao}</Text> : null}
              {guardiao ? (
                <View style={styles.guardiao}>
                  <Ionicons name="person-circle-outline" size={16} color="#A78BFA" />
                  <Text style={estilos.textoFraco}>Guardião: {guardiao.nome}</Text>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  selo: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  ponto: { width: 8, height: 8, borderRadius: 4 },
  seloTexto: { fontSize: 12, fontWeight: '700' },
  guardiao: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
});
