import { Redirect } from 'expo-router';

// Raiz do grupo (seguro): ao entrar pelo PIN o Expo Router abre o grupo e cai aqui;
// daqui seguimos para a primeira aba.
export default function InicioSeguro() {
  return <Redirect href={'/ocorrencias' as never} />;
}
