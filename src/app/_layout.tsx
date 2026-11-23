import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';

import { store, carregarEspacoSeguro, carregarEventos } from '../store';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

// Raiz da navegação. Um único Stack com dois grupos de rotas, e só um fica ativo:
//   (agenda) -> disfarce: agenda com menu lateral (Drawer)
//   (seguro) -> área real: Espaço Seguro (Tabs, cada aba com seu Stack)
// Entrada: PIN em Configurações > Diagnóstico de Sincronização.
// Saída rápida: botão vermelho no cabeçalho de qualquer tela. Quando o estado do Redux
// muda, o outro grupo passa a valer e o anterior sai do histórico (sem botão "voltar").
function Rotas() {
  const dispatch = useDispatch<any>();
  const autenticado = useSelector((state: any) => state.auth.estaAutenticado);

  // Disfarce: a agenda é carregada da API ao abrir o app.
  useEffect(() => {
    dispatch(carregarEventos());
  }, [dispatch]);

  // Espaço Seguro: só busca dados sensíveis depois da entrada.
  useEffect(() => {
    if (autenticado) dispatch(carregarEspacoSeguro());
  }, [autenticado, dispatch]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!autenticado}>
        <Stack.Screen name="(agenda)" />
      </Stack.Protected>
      <Stack.Protected guard={autenticado}>
        <Stack.Screen name="(seguro)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AnimatedSplashOverlay />
            <Rotas />
            <StatusBar style="auto" />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
