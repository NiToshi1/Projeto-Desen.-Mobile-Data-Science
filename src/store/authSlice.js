import { createSlice } from '@reduxjs/toolkit';

// ============================================================
// Slice de Autenticação / Controle do Disfarce:
// false = modo Disfarce ativo (Google Calendar visível)
// true  = modo Espaço Seguro ativo (área real protegida)
//
// Entrada: digitar o PIN '1234' em Configurações > Diagnóstico de
// Sincronização dispara entrarEspacoSeguro() (protótipo: PIN fixo).
// Saída rápida: 'SAIR AGORA' / BotaoSaidaRapida disparam
// sairEspacoSeguro() sem confirmação; o ocorrenciasSlice escuta essa
// ação e apaga os dados sensíveis da memória.
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
