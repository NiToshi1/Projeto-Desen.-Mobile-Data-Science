import { createSlice } from '@reduxjs/toolkit';

// ============================================================
// Slice de Autenticação / Controle do Disfarce:
// false = modo Disfarce ativo (Google Calendar visível)
// true  = modo Espaço Seguro ativo (área real protegida)
//
// Na Entrega 2, o gatilho é digitar o PIN '1234' na tela de
// Configurações do disfarce, que dispara entrarEspacoSeguro().
// O botão 'Sair' dispara sairEspacoSeguro(), limpando a sessão.
// ============================================================

const initialState = {
  estaAutenticado: false,
  pinCorreto: '1234',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    entrarEspacoSeguro: (state) => {
      state.estaAutenticado = true;
    },
    sairEspacoSeguro: (state) => {
      state.estaAutenticado = false;
    },
  },
});

export const { entrarEspacoSeguro, sairEspacoSeguro } = authSlice.actions;
export default authSlice.reducer;
