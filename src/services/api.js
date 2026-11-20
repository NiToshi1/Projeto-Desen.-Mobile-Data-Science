// ============================================================
// Camada de acesso à API Express (pasta api/ do repositório).
// Depois da migração para o Supabase, a API só serve o indicador de
// contexto territorial (modelo de Data Science). Eventos, ocorrências e
// guardiões ficam no banco: veja src/services/banco.js.
//
// Endereço da API (nesta ordem):
//   1. EXPO_PUBLIC_API_URL no arquivo .env (ex.: http://192.168.0.10:3333)
//   2. o mesmo IP do computador que serve o Expo (celular na mesma rede)
//   3. emulador Android -> 10.0.2.2 | iOS/web -> localhost
// ============================================================
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORTA_API = 3333;

function resolverBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:${PORTA_API}`;
  return Platform.OS === 'android'
    ? `http://10.0.2.2:${PORTA_API}`
    : `http://localhost:${PORTA_API}`;
}

export const BASE_URL = resolverBaseUrl();

// Faz o fetch e transforma respostas de erro (400, 404, 500...) em Error
// de verdade, para as telas tratarem tudo com try/catch.
async function requisitar(caminho, opcoes) {
  let resposta;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }
  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const mensagem = corpo?.erro || (corpo?.erros || []).join(' ') || `Erro ${resposta.status}`;
    throw new Error(mensagem);
  }
  return corpo;
}

// ---------- Indicador de contexto territorial (modelo de Data Science) ----------
export const obterRiscoTerritorial = () => requisitar('/risco-territorial');
export const buscarMunicipiosRisco = (uf, busca = '') =>
  requisitar(`/risco-territorial/municipios?uf=${encodeURIComponent(uf)}&busca=${encodeURIComponent(busca)}`);
