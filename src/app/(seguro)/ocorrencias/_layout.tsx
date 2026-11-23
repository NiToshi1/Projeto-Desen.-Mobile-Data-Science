import { Stack } from 'expo-router';
import { opcoesStack } from '../../../screens/seguro/opcoesStack';

export default function OcorrenciasLayout() {
  return (
    <Stack screenOptions={opcoesStack}>
      <Stack.Screen name="index" options={{ title: 'Espaço Seguro' }} />
      <Stack.Screen name="nova" options={{ title: 'Registrar ocorrência' }} />
    </Stack>
  );
}
