import { useWindowDimensions } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import MenuAgenda from '../../screens/disfarce/MenuAgenda';

// Disfarce: Drawer Navigator da "agenda". O menu lateral (MenuAgenda) escolhe a
// visualização (Semana ou Mês); "Configurações" é a segunda tela do Drawer e
// é por ela que o PIN leva ao Espaço Seguro.
export default function AgendaLayout() {
  const { width } = useWindowDimensions();
  // Largura numérica: com '78%' + maxWidth o Drawer calcula a animação com a largura errada
  // e, em tablet/monitor, abria só uma faixa de uns 40 px.
  const larguraMenu = Math.min(320, Math.round(width * 0.78));

  return (
    <Drawer
      drawerContent={(props) => <MenuAgenda {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front', // nunca fixo na tela, nem em monitor grande
        drawerStyle: { width: larguraMenu },
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="configuracoes" />
    </Drawer>
  );
}
