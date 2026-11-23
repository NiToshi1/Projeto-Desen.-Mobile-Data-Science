import { Stack } from 'expo-router';
import { opcoesStack } from '../../../screens/seguro/opcoesStack';

export default function ContextoLayout() {
  return (
    <Stack screenOptions={opcoesStack}>
      <Stack.Screen name="index" options={{ title: 'Contexto' }} />
    </Stack>
  );
}
