import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as api from '../services/api';

// ============================================================
// Slice da Agenda (Disfarce): eventos do "Google Calendar" vindos da
// API. Se a API estiver fora do ar, a agenda simplesmente fica vazia —
// o disfarce nunca exibe mensagens de erro que denunciem o app.
// ============================================================

const initialState = {
  eventos: [],
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(carregarEventos.fulfilled, (state, action) => {
        state.eventos = action.payload;
      })
      .addCase(salvarEvento.fulfilled, (state, action) => {
        state.eventos.unshift(action.payload);
      })
      .addCase(excluirEvento.fulfilled, (state, action) => {
        state.eventos = state.eventos.filter((ev) => ev.id !== action.payload);
      });
  },
});

export default agendaSlice.reducer;
