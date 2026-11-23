import { useIsFocused, useRouter } from 'expo-router';
import ConfiguracoesDisfarceModal from '../../screens/disfarce/ConfiguracoesDisfarceModal';

// O conteúdo de Configurações é um modal: só pode aparecer enquanto a tela está em foco.
export default function Configuracoes() {
  const router = useRouter();
  const emFoco = useIsFocused();
  return <ConfiguracoesDisfarceModal visivel={emFoco} aoFechar={() => router.navigate('/' as never)} />;
}
