import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../services/api';
import { sairEspacoSeguro } from './authSlice';

// ============================================================
// Slice do Espaço Seguro (Área Real) — dados vindos da API.
// Ocorrências (com evidências e encaminhamentos aninhados), contatos
// de confiança e rede de apoio especializada.
//
// Segurança: ao acionar a saída rápida, todo o conteúdo sensível é
// apagado da memória do app (ver extraReducers). Ele é recarregado da
// API na próxima entrada. Respostas que chegam depois da saída são
// descartadas (SESSAO_ENCERRADA), para nada reaparecer no disfarce.
// ============================================================

const SESSAO_ENCERRADA = 'sessao_encerrada';

const initialState = {
  ocorrencias: [],
  contatos: [],
  servicosApoio: [],
  carregando: false,
  erro: null,
};

// Junta evidências e encaminhamentos dentro de cada ocorrência.
function compor(ocorrencias, evidencias, encaminhamentos, servicos) {
  return ocorrencias.map((oc) => ({
    ...oc,
    evidencias: evidencias.filter((e) => e.ocorrenciaId === oc.id),
    encaminhamentos: encaminhamentos
      .filter((e) => e.ocorrenciaId === oc.id)
      .map((e) => ({
        ...e,
        servico: servicos.find((s) => s.id === e.servicoId)?.nome ?? 'Serviço removido',
      })),
  }));
}

const sessaoAtiva = (getState) => getState().auth.estaAutenticado;

// Carrega tudo do Espaço Seguro de uma vez.
export const carregarEspacoSeguro = createAsyncThunk(
  'ocorrencias/carregar',
  async (_, { getState, rejectWithValue }) => {
    const [ocorrencias, evidencias, encaminhamentos, contatos, servicos] = await Promise.all([
      api.listarOcorrencias(),
      api.listarEvidencias(),
      api.listarEncaminhamentos(),
      api.listarContatos(),
      api.listarServicos(),
    ]);
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return {
      ocorrencias: compor(ocorrencias, evidencias, encaminhamentos, servicos),
      contatos,
      servicosApoio: servicos,
    };
  }
);

// Cria a ocorrência e, se houver, a evidência ligada a ela (relacionamento
// validado pela API: a evidência só é aceita se a ocorrência existir).
export const salvarOcorrencia = createAsyncThunk(
  'ocorrencias/salvar',
  async ({ ocorrencia, evidencia }, { getState, rejectWithValue }) => {
    const criada = await api.criarOcorrencia(ocorrencia);
    const evidencias = evidencia
      ? [await api.criarEvidencia({ ...evidencia, ocorrenciaId: criada.id })]
      : [];
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return { ...criada, evidencias, encaminhamentos: [] };
  }
);

export const atualizarNivelRisco = createAsyncThunk(
  'ocorrencias/atualizarNivel',
  async ({ id, nivel_risco }, { getState, rejectWithValue }) => {
    const atualizada = await api.atualizarOcorrencia(id, { nivel_risco });
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return atualizada;
  }
);

export const excluirOcorrencia = createAsyncThunk('ocorrencias/excluir', async (id) => {
  await api.removerOcorrencia(id);
  return id;
});

export const salvarContato = createAsyncThunk(
  'contatos/salvar',
  async (contato, { getState, rejectWithValue }) => {
    await api.criarContato(contato);
    // A API garante "só um contato prioritário": recarrega a lista inteira.
    const contatos = await api.listarContatos();
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return contatos;
  }
);

export const alternarPrioridadeContato = createAsyncThunk(
  'contatos/prioridade',
  async (id, { getState, rejectWithValue }) => {
    const atual = getState().ocorrencias.contatos.find((c) => c.id === id);
    await api.atualizarContato(id, { prioridade: !atual?.prioridade });
    const contatos = await api.listarContatos();
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return contatos;
  }
);

export const excluirContato = createAsyncThunk('contatos/excluir', async (id) => {
  await api.removerContato(id);
  return id;
});

const registrarErro = (state, action) => {
  if (action.payload === SESSAO_ENCERRADA) return;
  state.erro = action.error?.message || 'Falha ao comunicar com o servidor.';
};

export const ocorrenciasSlice = createSlice({
  name: 'ocorrencias',
  initialState,
  reducers: {
    limparErro: (state) => {
      state.erro = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Saída rápida: apaga tudo o que é sensível da memória.
      .addCase(sairEspacoSeguro, () => initialState)
      .addCase(carregarEspacoSeguro.pending, (state) => {
        state.carregando = true;
        state.erro = null;
      })
      .addCase(carregarEspacoSeguro.fulfilled, (state, action) => {
        state.carregando = false;
        Object.assign(state, action.payload);
      })
      .addCase(carregarEspacoSeguro.rejected, (state, action) => {
        state.carregando = false;
        registrarErro(state, action);
      })
      .addCase(salvarOcorrencia.fulfilled, (state, action) => {
        state.ocorrencias.unshift(action.payload);
      })
      .addCase(atualizarNivelRisco.fulfilled, (state, action) => {
        const oc = state.ocorrencias.find((o) => o.id === action.payload.id);
        if (oc) oc.nivel_risco = action.payload.nivel_risco;
      })
      .addCase(excluirOcorrencia.fulfilled, (state, action) => {
        state.ocorrencias = state.ocorrencias.filter((o) => o.id !== action.payload);
      })
      .addCase(salvarContato.fulfilled, (state, action) => {
        state.contatos = action.payload;
      })
      .addCase(alternarPrioridadeContato.fulfilled, (state, action) => {
        state.contatos = action.payload;
      })
      .addCase(excluirContato.fulfilled, (state, action) => {
        state.contatos = state.contatos.filter((c) => c.id !== action.payload);
      })
      .addCase(salvarOcorrencia.rejected, registrarErro)
      .addCase(atualizarNivelRisco.rejected, registrarErro)
      .addCase(excluirOcorrencia.rejected, registrarErro)
      .addCase(salvarContato.rejected, registrarErro)
      .addCase(alternarPrioridadeContato.rejected, registrarErro)
      .addCase(excluirContato.rejected, registrarErro);
  },
});

export const { limparErro } = ocorrenciasSlice.actions;
export default ocorrenciasSlice.reducer;
