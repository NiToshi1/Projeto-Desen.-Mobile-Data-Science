import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import agendaReducer from './agendaSlice';
import ocorrenciasReducer from './ocorrenciasSlice';

// ============================================================
// Store Redux Central do Aplicativo:
// Conecta os reducers de Auth (disfarce), Agenda e Ocorrências.
// Atende ao requisito da Seção 6.2 do Documento Orientador.
// ============================================================

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agenda: agendaReducer,
    ocorrencias: ocorrenciasReducer,
  },
});

export default store;
