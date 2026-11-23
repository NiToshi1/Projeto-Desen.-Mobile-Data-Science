import { Stack } from 'expo-router';
import { opcoesStack } from '../../../screens/seguro/opcoesStack';

export default function GuardioesLayout() {
  return (
    <Stack screenOptions={opcoesStack}>
      <Stack.Screen name="index" options={{ title: 'Guardiões' }} />
      <Stack.Screen name="novo" options={{ title: 'Novo guardião' }} />
    </Stack>
  );
}
