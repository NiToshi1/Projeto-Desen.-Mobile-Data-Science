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
import { adicionarEvento } from '../../store/agendaSlice';

const CORES_CATEGORIAS = [
  { categoria: 'Trabalho', cor: '#1A73E8' },
  { categoria: 'Saúde', cor: '#0F9D58' },
  { categoria: 'Estudos', cor: '#E65100' },
  { categoria: 'Pessoal', cor: '#8E24AA' },
  { categoria: 'Feriado', cor: '#D93025' },
];

export default function NovoEventoModal({ visivel, aoFechar, dataPadrao = '2026-10-27' }) {
  const dispatch = useDispatch();
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState(dataPadrao);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('10:00');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(CORES_CATEGORIAS[0]);

  const handleSalvar = () => {
    if (!titulo.trim()) {
      Alert.alert('Título obrigatório', 'Por favor, insira o título do evento.');
      return;
    }

    const novoEvento = {
      id: `ev-${Date.now()}`,
      titulo: titulo.trim(),
      data: data.trim(),
      horaInicio: horaInicio.trim(),
      horaFim: horaFim.trim(),
      local: local.trim(),
      descricao: descricao.trim(),
      cor: categoriaSelecionada.cor,
      categoria: categoriaSelecionada.categoria,
    };

    dispatch(adicionarEvento(novoEvento));
    // Limpar campos
    setTitulo('');
    setLocal('');
    setDescricao('');
    aoFechar();
  };

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={aoFechar} hitSlop={10} style={styles.botaoFechar}>
            <Ionicons name="close" size={26} color="#3C4043" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Novo Evento</Text>
          <TouchableOpacity onPress={handleSalvar} style={styles.botaoSalvar}>
            <Text style={styles.textoSalvar}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
          {/* Título do evento */}
          <View style={styles.campoContainer}>
            <Ionicons name="bookmark-outline" size={22} color="#5F6368" style={styles.iconeCampo} />
            <TextInput
              style={styles.inputTitulo}
              placeholder="Adicionar título"
              placeholderTextColor="#9AA0A6"
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

          <View style={styles.divisor} />

          {/* Data e Horário */}
          <View style={styles.campoContainer}>
            <Ionicons name="time-outline" size={22} color="#5F6368" style={styles.iconeCampo} />
            <View style={styles.linhaHorarios}>
              <View style={styles.blocoInputPequeno}>
                <Text style={styles.labelPequeno}>Data (AAAA-MM-DD)</Text>
                <TextInput
                  style={styles.inputComum}
                  value={data}
                  onChangeText={setData}
                  placeholder="2026-10-27"
                />
              </View>
              <View style={styles.blocoInputPequeno}>
                <Text style={styles.labelPequeno}>Início</Text>
                <TextInput
                  style={styles.inputComum}
                  value={horaInicio}
                  onChangeText={setHoraInicio}
                  placeholder="09:00"
                />
              </View>
              <View style={styles.blocoInputPequeno}>
                <Text style={styles.labelPequeno}>Fim</Text>
                <TextInput
                  style={styles.inputComum}
                  value={horaFim}
                  onChangeText={setHoraFim}
                  placeholder="10:00"
                />
              </View>
            </View>
          </View>

          <View style={styles.divisor} />

          {/* Local */}
          <View style={styles.campoContainer}>
            <Ionicons name="location-outline" size={22} color="#5F6368" style={styles.iconeCampo} />
            <TextInput
              style={styles.inputComum}
              placeholder="Adicionar local ou link de reunião"
              placeholderTextColor="#9AA0A6"
              value={local}
              onChangeText={setLocal}
            />
          </View>

          <View style={styles.divisor} />

          {/* Categoria / Cor */}
          <View style={styles.campoContainer}>
            <Ionicons name="color-palette-outline" size={22} color="#5F6368" style={styles.iconeCampo} />
            <View style={styles.categoriaContainer}>
              <Text style={styles.labelPequeno}>Categoria / Cor</Text>
              <View style={styles.listaCores}>
                {CORES_CATEGORIAS.map((cat) => {
                  const selecionada = categoriaSelecionada.categoria === cat.categoria;
                  return (
                    <TouchableOpacity
                      key={cat.categoria}
                      style={[
                        styles.chipCategoria,
                        { borderColor: cat.cor },
                        selecionada && { backgroundColor: `${cat.cor}20` },
                      ]}
                      onPress={() => setCategoriaSelecionada(cat)}
                    >
                      <View style={[styles.pontoCor, { backgroundColor: cat.cor }]} />
                      <Text style={[styles.textoChip, { color: cat.cor }]}>{cat.categoria}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.divisor} />

          {/* Descrição */}
          <View style={styles.campoContainer}>
            <Ionicons name="reader-outline" size={22} color="#5F6368" style={styles.iconeCampo} />
            <TextInput
              style={[styles.inputComum, styles.inputDescricao]}
              placeholder="Adicionar descrição ou anotações"
              placeholderTextColor="#9AA0A6"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
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
  botaoFechar: {
    padding: 6,
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C4043',
  },
  botaoSalvar: {
    backgroundColor: '#1A73E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  campoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  iconeCampo: {
    marginTop: 4,
    marginRight: 16,
  },
  inputTitulo: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: '#202124',
    padding: 0,
  },
  linhaHorarios: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  blocoInputPequeno: {
    flex: 1,
  },
  labelPequeno: {
    fontSize: 11,
    color: '#70757A',
    marginBottom: 4,
  },
  inputComum: {
    flex: 1,
    fontSize: 14,
    color: '#202124',
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
  },
  categoriaContainer: {
    flex: 1,
  },
  listaCores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chipCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  pontoCor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textoChip: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputDescricao: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  divisor: {
    height: 1,
    backgroundColor: '#F1F3F4',
  },
});
