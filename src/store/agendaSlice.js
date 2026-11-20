import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as banco from '../services/banco';

// ============================================================
// Slice da Agenda (Disfarce): eventos do "Google Calendar" lidos e
// gravados no banco (Supabase). Se o banco estiver fora do ar, a agenda
// simplesmente fica vazia — o disfarce nunca exibe mensagens de erro na
// tela que denunciem o app (só ao tentar salvar um evento).
// ============================================================

const initialState = {
  eventos: [],
};

export const carregarEventos = createAsyncThunk('agenda/carregar', () => banco.listarEventos());

export const salvarEvento = createAsyncThunk('agenda/salvar', (evento) => banco.criarEvento(evento));

export const excluirEvento = createAsyncThunk('agenda/excluir', async (id) => {
  await banco.removerEvento(id);
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
        state.eventos.push(action.payload);
      })
      .addCase(excluirEvento.fulfilled, (state, action) => {
        state.eventos = state.eventos.filter((ev) => ev.id !== action.payload);
      });
  },
});

export default agendaSlice.reducer;
