import { createSlice } from '@reduxjs/toolkit';

// ============================================================
// Slice da Agenda (Disfarce):
// Guarda eventos do Google Calendar, tarefas (Google Tasks) e
// aniversários. Isso garante que a agenda pareça 100% autêntica
// caso qualquer pessoa acesse o celular.
// ============================================================

const initialState = {
  eventos: [
    {
      id: 'ev-1',
      titulo: 'Dentista - Dra. Juliana',
      data: '2026-10-27',
      horaInicio: '14:00',
      horaFim: '15:00',
      local: 'Av. Higienópolis, 800 - Sala 402',
      descricao: 'Consulta de rotina e limpeza semestral.',
      cor: '#0F9D58', // Verde (Saúde)
      categoria: 'Saúde',
    },
    {
      id: 'ev-2',
      titulo: 'Reunião de Alinhamento - Projeto',
      data: '2026-10-27',
      horaInicio: '16:30',
      horaFim: '17:30',
      local: 'Google Meet',
      descricao: 'Alinhamento dos entregáveis da Sprint e revisão do cronograma.',
      cor: '#1A73E8', // Azul (Trabalho)
      categoria: 'Trabalho',
    },
    {
      id: 'ev-3',
      titulo: 'Entrega Trabalho Acadêmico',
      data: '2026-10-28',
      horaInicio: '19:00',
      horaFim: '21:00',
      local: 'Universidade Positivo - Campus Londrina',
      descricao: 'Apresentação e checklist do checkpoint do 2º semestre.',
      cor: '#E65100', // Laranja (Estudos)
      categoria: 'Estudos',
    },
    {
      id: 'ev-4',
      titulo: 'Almoço de Domingo com a Família',
      data: '2026-11-01',
      horaInicio: '12:30',
      horaFim: '15:00',
      local: 'Casa dos Pais',
      descricao: 'Almoço em família com sobremesa especial.',
      cor: '#8E24AA', // Roxo (Pessoal)
      categoria: 'Pessoal',
    },
    {
      id: 'ev-5',
      titulo: 'Proclamação da República (Feriado)',
      data: '2026-11-15',
      horaInicio: '08:00',
      horaFim: '18:00',
      local: 'Feriado Nacional',
      descricao: 'Feriado nacional brasileiro.',
      cor: '#D93025', // Vermelho (Feriado)
      categoria: 'Feriado',
    },
  ],
  tarefas: [
    { id: 'tf-1', titulo: 'Comprar remédio antialérgico na farmácia', concluida: false },
    { id: 'tf-2', titulo: 'Pagar conta de energia elétrica', concluida: true },
    { id: 'tf-3', titulo: 'Revisar anotações da aula de Mobile', concluida: false },
    { id: 'tf-4', titulo: 'Fazer backup das fotos da viagem', concluida: false },
    { id: 'tf-5', titulo: 'Ligar para marcar revisão do carro', concluida: true },
  ],
  aniversarios: [
    { id: 'an-1', nome: 'Mariana Costa', data: '12 de Novembro', parentesco: 'Irmã' },
    { id: 'an-2', nome: 'Lucas Silva', data: '03 de Dezembro', parentesco: 'Primo' },
    { id: 'an-3', nome: 'Beatriz Lima', data: '18 de Dezembro', parentesco: 'Amiga' },
    { id: 'an-4', nome: 'Carlos Eduardo', data: '22 de Janeiro', parentesco: 'Colega de Trabalho' },
  ],
};

export const agendaSlice = createSlice({
  name: 'agenda',
  initialState,
  reducers: {
    adicionarEvento: (state, action) => {
      state.eventos.unshift(action.payload);
    },
    removerEvento: (state, action) => {
      state.eventos = state.eventos.filter((ev) => ev.id !== action.payload);
    },
    alternarTarefa: (state, action) => {
      const tarefa = state.tarefas.find((t) => t.id === action.payload);
      if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
      }
    },
    adicionarTarefa: (state, action) => {
      state.tarefas.unshift(action.payload);
    },
    adicionarAniversario: (state, action) => {
      state.aniversarios.push(action.payload);
    },
  },
});

export const {
  adicionarEvento,
  removerEvento,
  alternarTarefa,
  adicionarTarefa,
  adicionarAniversario,
} = agendaSlice.actions;

export default agendaSlice.reducer;
