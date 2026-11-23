import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../services/api';

// ============================================================
// Slice da Agenda (Disfarce): eventos do "Google Calendar" vindos da
// API, mais a visualização (Semana ou Mês) escolhida no menu lateral,
// que o Drawer e a tela do calendário compartilham.
// Se a API estiver fora do ar, a agenda simplesmente fica vazia — o
// disfarce nunca exibe mensagens de erro na tela que denunciem o app
// (só ao tentar salvar um evento).
// ============================================================

const initialState = {
  eventos: [],
  visualizacao: 'Mês', // Semana | Mês
};

export const carregarEventos = createAsyncThunk('agenda/carregar', () => api.listarEventos());

export const salvarEvento = createAsyncThunk('agenda/salvar', (evento) => api.criarEvento(evento));

export const excluirEvento = createAsyncThunk('agenda/excluir', async (id) => {
  await api.removerEvento(id);
  return id;
});

export const agendaSlice = createSlice({
  name: 'agenda',
  initialState,
  reducers: {
    definirVisualizacao: (state, action) => {
      state.visualizacao = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(carregarEventos.fulfilled, (state, action) => {
        state.eventos = action.payload;
      })
      .addCase(salvarEvento.fulfilled, (state, action) => {
        state.eventos.push(action.payload);
      })
      .addCase(excluirEvento.fulfilled, (state, action) => {
        state.eventos = state.eventos.filter((ev) => ev.id !== action.payload);
      });
  },
});

export const { definirVisualizacao } = agendaSlice.actions;
export default agendaSlice.reducer;
