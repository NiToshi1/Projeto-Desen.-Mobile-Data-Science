// ============================================================
// Camada de acesso à API Express (pasta api/ do repositório).
// Toda tela lê e grava por estas funções; a API é quem guarda os dados
// (em arquivos JSON na pasta api/dados). O app não acessa nenhum banco.
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

// Chave de acesso da API publicada (mesmo valor de API_TOKEN no servidor). Opcional.
const CABECALHO_CHAVE = process.env.EXPO_PUBLIC_API_KEY ? { 'x-api-key': process.env.EXPO_PUBLIC_API_KEY } : {};

// Faz o fetch e transforma respostas de erro (400, 404, 500...) em Error
// de verdade, para as telas tratarem tudo com try/catch.
async function requisitar(caminho, opcoes) {
  let resposta;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json', ...CABECALHO_CHAVE },
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

const post = (rota, dados) => requisitar(rota, { method: 'POST', body: JSON.stringify(dados) });
const put = (rota, id, dados) => requisitar(`${rota}/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
const del = (rota, id) => requisitar(`${rota}/${id}`, { method: 'DELETE' });

// ---------- Eventos da agenda (disfarce) ----------
export const listarEventos = () => requisitar('/eventos');
export const criarEvento = (dados) => post('/eventos', dados);
export const removerEvento = (id) => del('/eventos', id);

// ---------- Ocorrências ----------
export const listarOcorrencias = () => requisitar('/ocorrencias');
export const criarOcorrencia = (dados) => post('/ocorrencias', dados);
export const removerOcorrencia = (id) => del('/ocorrencias', id);

// ---------- Guardiões ----------
export const listarGuardioes = () => requisitar('/guardioes');
export const criarGuardiao = (dados) => post('/guardioes', dados);
export const atualizarGuardiao = (id, dados) => put('/guardioes', id, dados);
export const removerGuardiao = (id) => del('/guardioes', id);

// ---------- Indicador de contexto territorial (modelo de Data Science) ----------
export const obterRiscoTerritorial = () => requisitar('/risco-territorial');
export const buscarMunicipiosRisco = (uf, busca = '') =>
  requisitar(`/risco-territorial/municipios?uf=${encodeURIComponent(uf)}&busca=${encodeURIComponent(busca)}`);
