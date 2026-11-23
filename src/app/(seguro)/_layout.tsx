import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

// Espaço Seguro: Tab Navigator com 3 abas. Cada aba é uma pasta com o seu próprio Stack
// (ocorrencias/, guardioes/, contexto/), e o botão de saída rápida fica no cabeçalho de
// todas as telas (veja screens/seguro/opcoesStack.js).
const aba = (title: string, ativo: any, inativo: any) => ({
  title,
  tabBarIcon: ({ focused, color }: { focused: boolean; color: any }) => (
    <Ionicons name={focused ? ativo : inativo} size={22} color={color} />
  ),
});

export default function SeguroLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0F172A', borderTopColor: '#1E293B' },
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="ocorrencias" options={aba('Ocorrências', 'shield-checkmark', 'shield-outline')} />
      <Tabs.Screen name="guardioes" options={aba('Guardiões', 'people', 'people-outline')} />
      <Tabs.Screen name="contexto" options={aba('Contexto', 'analytics', 'analytics-outline')} />
    </Tabs>
  );
}
