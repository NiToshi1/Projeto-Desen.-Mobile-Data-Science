import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../services/api';
import { sairEspacoSeguro } from './authSlice';

// ============================================================
// Slice do Espaço Seguro (Área Real) — dados vindos da API.
// Ocorrências (com nível de perigo de 1 a 10) e guardiões de confiança.
//
// Segurança: ao acionar a saída rápida, todo o conteúdo sensível é
// apagado da memória do app (ver extraReducers). Ele é recarregado da
// API na próxima entrada. Respostas que chegam depois da saída são
// descartadas (SESSAO_ENCERRADA), para nada reaparecer no disfarce.
// ============================================================

const SESSAO_ENCERRADA = 'sessao_encerrada';

const initialState = {
  ocorrencias: [],
  guardioes: [],
  carregando: false,
  erro: null,
};

const sessaoAtiva = (getState) => getState().auth.estaAutenticado;

// Carrega tudo do Espaço Seguro de uma vez.
export const carregarEspacoSeguro = createAsyncThunk(
  'ocorrencias/carregar',
  async (_, { getState, rejectWithValue }) => {
    const [ocorrencias, guardioes] = await Promise.all([
      api.listarOcorrencias(),
      api.listarGuardioes(),
    ]);
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return { ocorrencias, guardioes };
  }
);

export const salvarOcorrencia = createAsyncThunk(
  'ocorrencias/salvar',
  async (ocorrencia, { getState, rejectWithValue }) => {
    const criada = await api.criarOcorrencia(ocorrencia);
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return criada;
  }
);

export const atualizarOcorrencia = createAsyncThunk(
  'ocorrencias/atualizar',
  async ({ id, dados }, { getState, rejectWithValue }) => {
    const atualizada = await api.atualizarOcorrencia(id, dados);
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return atualizada;
  }
);

export const excluirOcorrencia = createAsyncThunk('ocorrencias/excluir', async (id) => {
  await api.removerOcorrencia(id);
  return id;
});

// Depois de gravar um guardião, recarrega a lista: a API decide a ordem e
// garante "só um guardião com prioridade".
export const salvarGuardiao = createAsyncThunk(
  'guardioes/salvar',
  async (guardiao, { getState, rejectWithValue }) => {
    await api.criarGuardiao(guardiao);
    const guardioes = await api.listarGuardioes();
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return guardioes;
  }
);

export const editarGuardiao = createAsyncThunk(
  'guardioes/editar',
  async ({ id, dados }, { getState, rejectWithValue }) => {
    await api.atualizarGuardiao(id, dados);
    const guardioes = await api.listarGuardioes();
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return guardioes;
  }
);

export const alternarPrioridadeGuardiao = createAsyncThunk(
  'guardioes/prioridade',
  async (id, { getState, rejectWithValue }) => {
    const atual = getState().ocorrencias.guardioes.find((g) => g.id === id);
    await api.atualizarGuardiao(id, { prioridade: !atual?.prioridade });
    const guardioes = await api.listarGuardioes();
    if (!sessaoAtiva(getState)) return rejectWithValue(SESSAO_ENCERRADA);
    return guardioes;
  }
);

export const excluirGuardiao = createAsyncThunk('guardioes/excluir', async (id) => {
  await api.removerGuardiao(id);
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
      .addCase(atualizarOcorrencia.fulfilled, (state, action) => {
        state.ocorrencias = state.ocorrencias.map((o) => (o.id === action.payload.id ? action.payload : o));
      })
      .addCase(excluirOcorrencia.fulfilled, (state, action) => {
        state.ocorrencias = state.ocorrencias.filter((o) => o.id !== action.payload);
      })
      .addCase(salvarGuardiao.fulfilled, (state, action) => {
        state.guardioes = action.payload;
      })
      .addCase(editarGuardiao.fulfilled, (state, action) => {
        state.guardioes = action.payload;
      })
      .addCase(alternarPrioridadeGuardiao.fulfilled, (state, action) => {
        state.guardioes = action.payload;
      })
      .addCase(excluirGuardiao.fulfilled, (state, action) => {
        state.guardioes = state.guardioes.filter((g) => g.id !== action.payload);
        // A API mantém as ocorrências e zera o guardião delas: espelhamos isso aqui.
        state.ocorrencias.forEach((o) => {
          if (o.guardiao_id === action.payload) o.guardiao_id = null;
        });
      })
      .addCase(salvarOcorrencia.rejected, registrarErro)
      .addCase(atualizarOcorrencia.rejected, registrarErro)
      .addCase(editarGuardiao.rejected, registrarErro)
      .addCase(excluirOcorrencia.rejected, registrarErro)
      .addCase(salvarGuardiao.rejected, registrarErro)
      .addCase(alternarPrioridadeGuardiao.rejected, registrarErro)
      .addCase(excluirGuardiao.rejected, registrarErro);
  },
});

export const { limparErro } = ocorrenciasSlice.actions;
export default ocorrenciasSlice.reducer;
