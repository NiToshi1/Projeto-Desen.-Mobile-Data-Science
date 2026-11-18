// ============================================================
// Camada de acesso à API (pasta api/ do repositório).
// Desde a Entrega 4 o app não usa mais dados simulados: toda tela lê
// e grava pela API real, através destas funções.
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

const post = (rota, dados) => requisitar(rota, { method: 'POST', body: JSON.stringify(dados) });
const put = (rota, id, dados) =>
  requisitar(`${rota}/${id}`, { method: 'PUT', body: JSON.stringify(dados) });
const del = (rota, id) => requisitar(`${rota}/${id}`, { method: 'DELETE' });

// ---------- Ocorrências ----------
export const listarOcorrencias = () => requisitar('/ocorrencias');
export const criarOcorrencia = (dados) => post('/ocorrencias', dados);
export const atualizarOcorrencia = (id, dados) => put('/ocorrencias', id, dados);
export const removerOcorrencia = (id) => del('/ocorrencias', id);

// ---------- Evidências ----------
export const listarEvidencias = () => requisitar('/evidencias');
export const criarEvidencia = (dados) => post('/evidencias', dados);
export const removerEvidencia = (id) => del('/evidencias', id);

// ---------- Encaminhamentos ----------
export const listarEncaminhamentos = () => requisitar('/encaminhamentos');
export const criarEncaminhamento = (dados) => post('/encaminhamentos', dados);

// ---------- Serviços de apoio ----------
export const listarServicos = () => requisitar('/servicos');

// ---------- Contatos ----------
export const listarContatos = () => requisitar('/contatos');
export const criarContato = (dados) => post('/contatos', dados);
export const atualizarContato = (id, dados) => put('/contatos', id, dados);
export const removerContato = (id) => del('/contatos', id);

// ---------- Eventos da agenda (disfarce) ----------
export const listarEventos = () => requisitar('/eventos');
export const criarEvento = (dados) => post('/eventos', dados);
export const atualizarEvento = (id, dados) => put('/eventos', id, dados);
export const removerEvento = (id) => del('/eventos', id);
