import { Alert, Platform } from 'react-native';

// No celular usa o Alert nativo. No navegador (react-native-web) o Alert.alert não faz
// nada, então aqui usamos window.confirm / window.alert para que confirmações de
// exclusão e avisos de validação também funcionem ao testar pelo navegador.
//
// Uso (igual ao Alert.alert):
//   alertar('Título', 'Mensagem');
//   alertar('Excluir', 'Tem certeza?', [
//     { text: 'Cancelar', style: 'cancel' },
//     { text: 'Excluir', style: 'destructive', onPress: () => ... },
//   ]);
export function alertar(titulo, mensagem, botoes) {
  if (Platform.OS !== 'web') {
    Alert.alert(titulo, mensagem, botoes);
    return;
  }
  const texto = mensagem ? `${titulo}\n\n${mensagem}` : titulo;
  const confirmacao = botoes?.some((b) => b.style === 'cancel');
  if (confirmacao) {
    // pergunta com OK/Cancelar: executa o botão que não é "cancelar" se a pessoa confirmar
    if (window.confirm(texto)) {
      botoes.find((b) => b.style !== 'cancel')?.onPress?.();
    }
    return;
  }
  window.alert(texto);
  botoes?.[0]?.onPress?.();
}
