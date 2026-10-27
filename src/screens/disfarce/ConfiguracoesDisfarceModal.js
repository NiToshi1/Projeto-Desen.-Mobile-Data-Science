import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Ionicons from '@expo/vector-icons/Ionicons';
import { entrarEspacoSeguro } from '../../store/authSlice';

export default function ConfiguracoesDisfarceModal({ visivel, aoFechar }) {
  const dispatch = useDispatch();
  const [notificacoes, setNotificacoes] = useState(true);
  const [mostrarModalPin, setMostrarModalPin] = useState(false);
  const [pinDigitado, setPinDigitado] = useState('');
  const [erroPin, setErroPin] = useState('');

  const handleValidarPin = (pinParaTestar) => {
    const valor = pinParaTestar !== undefined ? pinParaTestar : pinDigitado;
    if (valor === '1234') {
      setPinDigitado('');
      setErroPin('');
      setMostrarModalPin(false);
      aoFechar();
      // Dispara o gatilho do Espaço Seguro conforme especificado no projeto
      dispatch(entrarEspacoSeguro());
    } else {
      setErroPin('Código de diagnóstico não reconhecido.');
      setPinDigitado('');
    }
  };

  const handleDigitarDigito = (digito) => {
    if (pinDigitado.length < 4) {
      const novoPin = pinDigitado + digito;
      setPinDigitado(novoPin);
      if (novoPin.length === 4) {
        handleValidarPin(novoPin);
      }
    }
  };

  const handleApagarDigito = () => {
    setPinDigitado((prev) => prev.slice(0, -1));
    setErroPin('');
  };

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      onRequestClose={aoFechar}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header superior */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={aoFechar}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={24} color="#3C4043" />
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Configurações</Text>
        </View>

        <ScrollView style={styles.conteudo} showsVerticalScrollIndicator={false}>
          {/* Seção Geral */}
          <View style={styles.secao}>
            <Text style={styles.secaoHeader}>Geral</Text>

            <View style={styles.itemLinha}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>Início da semana</Text>
                <Text style={styles.itemSubtitulo}>Segunda-feira</Text>
              </View>
            </View>

            <View style={styles.itemLinha}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>Usar fuso horário do dispositivo</Text>
                <Text style={styles.itemSubtitulo}>GMT-03:00 Horário Padrão de Brasília</Text>
              </View>
            </View>

            <View style={styles.itemLinha}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>Duração padrão de novos eventos</Text>
                <Text style={styles.itemSubtitulo}>60 minutos</Text>
              </View>
            </View>

            <View style={styles.itemLinhaComSwitch}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>Notificações no dispositivo</Text>
                <Text style={styles.itemSubtitulo}>Alertar 10 minutos antes de reuniões</Text>
              </View>
              <Switch
                value={notificacoes}
                onValueChange={setNotificacoes}
                trackColor={{ false: '#BDC1C6', true: '#8AB4F8' }}
                thumbColor={notificacoes ? '#1A73E8' : '#F1F3F4'}
              />
            </View>
          </View>

          <View style={styles.divisor} />

          {/* Seção Contas & Sincronização */}
          <View style={styles.secao}>
            <Text style={styles.secaoHeader}>Contas e Sincronização</Text>

            <View style={styles.itemLinha}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>Conta ativa</Text>
                <Text style={styles.itemSubtitulo}>fernando.souza@gmail.com</Text>
              </View>
            </View>

            <View style={styles.itemLinha}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>Status da sincronização</Text>
                <Text style={styles.itemSubtitulo}>Sincronizado há 3 minutos</Text>
              </View>
              <Ionicons name="cloud-done-outline" size={20} color="#0F9D58" />
            </View>
          </View>

          <View style={styles.divisor} />

          {/* Seção Sobre / Diagnóstico Disfarçado */}
          <View style={styles.secao}>
            <Text style={styles.secaoHeader}>Sobre a Agenda</Text>

            <View style={styles.itemLinha}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>Versão do aplicativo</Text>
                <Text style={styles.itemSubtitulo}>v2026.42.0.release-build</Text>
              </View>
            </View>

            <View style={styles.itemLinha}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>Termos de Serviço e Privacidade</Text>
                <Text style={styles.itemSubtitulo}>Políticas padrão do Google LLC</Text>
              </View>
            </View>

            {/* Item Gatilho Disfarçado para o Espaço Seguro */}
            <TouchableOpacity
              style={[styles.itemLinha, styles.itemGatilho]}
              onPress={() => {
                setErroPin('');
                setPinDigitado('');
                setMostrarModalPin(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitulo}>Diagnóstico de Sincronização</Text>
                <Text style={styles.itemSubtitulo}>
                  Toque para validar código de integridade dos dados locais
                </Text>
              </View>
              <Ionicons name="keypad-outline" size={22} color="#5F6368" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal de Entrada de PIN Disfarçado */}
        <Modal
          visible={mostrarModalPin}
          transparent
          animationType="fade"
          onRequestClose={() => setMostrarModalPin(false)}
        >
          <View style={styles.pinOverlay}>
            <View style={styles.pinCard}>
              <View style={styles.pinHeader}>
                <Ionicons name="shield-checkmark" size={32} color="#1A73E8" />
                <Text style={styles.pinTitulo}>Código de Diagnóstico</Text>
                <Text style={styles.pinSubtitulo}>
                  Insira o código de 4 dígitos para verificação do sistema
                </Text>
              </View>

              {/* Indicadores Visuais de Dígitos */}
              <View style={styles.indicadoresContainer}>
                {[0, 1, 2, 3].map((index) => {
                  const preenchido = pinDigitado.length > index;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.indicadorCirculo,
                        preenchido && styles.indicadorCirculoPreenchido,
                      ]}
                    />
                  );
                })}
              </View>

              {erroPin ? <Text style={styles.textoErroPin}>{erroPin}</Text> : null}

              {/* Teclado Numérico Discreto */}
              <View style={styles.tecladoNumerico}>
                {[
                  ['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['C', '0', '⌫'],
                ].map((linha, linhaIdx) => (
                  <View key={linhaIdx} style={styles.linhaTeclado}>
                    {linha.map((tecla) => (
                      <TouchableOpacity
                        key={tecla}
                        style={styles.botaoTeclado}
                        onPress={() => {
                          if (tecla === 'C') {
                            setPinDigitado('');
                            setErroPin('');
                          } else if (tecla === '⌫') {
                            handleApagarDigito();
                          } else {
                            handleDigitarDigito(tecla);
                          }
                        }}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.textoBotaoTeclado}>{tecla}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.botaoCancelarPin}
                onPress={() => setMostrarModalPin(false)}
              >
                <Text style={styles.textoCancelarPin}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
    gap: 16,
  },
  botaoVoltar: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C4043',
  },
  conteudo: {
    flex: 1,
  },
  secao: {
    paddingVertical: 12,
  },
  secaoHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A73E8',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  itemLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  itemLinhaComSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  itemGatilho: {
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8EAED',
    marginTop: 6,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitulo: {
    fontSize: 15,
    fontWeight: '500',
    color: '#202124',
  },
  itemSubtitulo: {
    fontSize: 13,
    color: '#5F6368',
    marginTop: 2,
  },
  divisor: {
    height: 1,
    backgroundColor: '#F1F3F4',
    marginVertical: 4,
  },
  pinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pinCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  pinHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pinTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202124',
    marginTop: 10,
  },
  pinSubtitulo: {
    fontSize: 13,
    color: '#5F6368',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  indicadoresContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  indicadorCirculo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#BDC1C6',
    backgroundColor: 'transparent',
  },
  indicadorCirculoPreenchido: {
    borderColor: '#1A73E8',
    backgroundColor: '#1A73E8',
  },
  textoErroPin: {
    fontSize: 12,
    color: '#D93025',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  tecladoNumerico: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  linhaTeclado: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  botaoTeclado: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F3F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoTeclado: {
    fontSize: 22,
    fontWeight: '600',
    color: '#202124',
  },
  botaoCancelarPin: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  textoCancelarPin: {
    fontSize: 14,
    color: '#5F6368',
    fontWeight: '600',
  },
});
