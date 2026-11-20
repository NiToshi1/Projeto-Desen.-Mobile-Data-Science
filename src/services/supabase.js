// ============================================================
// Cliente do banco de dados (Supabase / Postgres).
// URL e chave pública vêm do arquivo .env (copie de .env.example):
//   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   EXPO_PUBLIC_SUPABASE_ANON_KEY=<chave anon / publishable>
// Reinicie o Expo depois de mudar o .env.
//
// Só a chave PÚBLICA entra no app. Nunca coloque a service_role aqui.
// O app não usa login, então a sessão não é guardada em lugar nenhum.
// ============================================================
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// No celular o fetch/URL do Hermes é incompleto; o polyfill resolve. Na web não é preciso.
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

const URL_BANCO = process.env.EXPO_PUBLIC_SUPABASE_URL;
const CHAVE_BANCO = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const bancoConfigurado = Boolean(URL_BANCO && CHAVE_BANCO);

export const supabase = bancoConfigurado
  ? createClient(URL_BANCO, CHAVE_BANCO, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;
