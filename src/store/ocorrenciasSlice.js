import { createSlice } from '@reduxjs/toolkit';

// ============================================================
// Slice do Espaço Seguro (Área Real):
// Armazena com segurança as ocorrências registradas pela vítima,
// o nível de risco (1 a 5), evidências anexadas (foto, áudio, doc),
// contatos de emergência e rede de apoio especializada.
// ============================================================

const initialState = {
  ocorrencias: [
    {
      id: 'oc-1',
      data_ocorrencia: '2026-10-24 21:40',
      tipo_violencia: 'Psicológica',
      local: 'Residência - Sala de Estar',
      descricao:
        'Ameaças verbais constantes, ofensas à minha integridade e tentativa de reter meu celular após discussão.',
      nivel_risco: 4, // 1 (Leve) a 5 (Crítico)
      evidencias: [
        {
          id: 'ev-1',
          tipo: 'audio',
          nome: 'gravacao_ameacas_24out.m4a',
          descricao: 'Áudio gravado discretamente com as ameaças proferidas.',
          data_upload: '24/10/2026',
        },
        {
          id: 'ev-2',
          tipo: 'foto',
          nome: 'print_mensagens_whatsapp.png',
          descricao: 'Captura de tela com chantagens e mensagens intimidatórias.',
          data_upload: '24/10/2026',
        },
      ],
      encaminhamentos: [
        {
          id: 'enc-1',
          servico: 'CRAM Londrina',
          data: '25/10/2026',
          status: 'Atendimento Agendado',
        },
      ],
    },
    {
      id: 'oc-2',
      data_ocorrencia: '2026-10-18 19:15',
      tipo_violencia: 'Patrimonial',
      local: 'Residência',
      descricao:
        'Destruição proposital de documentos pessoais (RG, carteira de trabalho) e quebra de objetos pessoais.',
      nivel_risco: 3,
      evidencias: [
        {
          id: 'ev-3',
          tipo: 'foto',
          nome: 'foto_documentos_danificados.jpg',
          descricao: 'Foto dos documentos rasgados no chão do quarto.',
          data_upload: '18/10/2026',
        },
      ],
      encaminhamentos: [],
    },
  ],
  contatos: [
    {
      id: 'ct-1',
      nome: 'Mariana Vaz',
      parentesco: 'Irmã',
      telefone: '(43) 99881-2233',
      contato_confianca: true,
      prioridade: true, // Estrela (Chamar Primeiro)
    },
    {
      id: 'ct-2',
      nome: 'Dra. Deise Souza',
      parentesco: 'Advogada',
      telefone: '(43) 99123-4567',
      contato_confianca: true,
      prioridade: false,
    },
    {
      id: 'ct-3',
      nome: 'Juliana Mendes',
      parentesco: 'Amiga Próxima',
      telefone: '(43) 99765-8899',
      contato_confianca: true,
      prioridade: false,
    },
  ],
  servicosApoio: [
    {
      id: 'srv-1',
      nome: 'DEAM - Delegacia da Mulher Londrina',
      tipo: 'Delegacia Especializada da Polícia Civil',
      telefone: '(43) 3322-1633',
      endereco: 'Rua Alagoas, 463 - Centro, Londrina - PR',
      atendimento_24h: true,
      descricao: 'Registro de boletim de ocorrência e pedido de medidas protetivas de urgência.',
    },
    {
      id: 'srv-2',
      nome: 'CRAM - Centro de Referência à Mulher',
      tipo: 'Acolhimento Psicológico, Social e Jurídico',
      telefone: '(43) 3378-0132',
      endereco: 'Rua Valparaíso, 189 - Londrina - PR',
      atendimento_24h: false,
      descricao: 'Atendimento humanizado multidisciplinar com assistentes sociais e psicólogas.',
    },
    {
      id: 'srv-3',
      nome: 'Patrulha Maria da Penha (Guarda Municipal)',
      tipo: 'Fiscalização e Proteção Imediata',
      telefone: '153',
      endereco: 'Atendimento móvel emergencial em Londrina',
      atendimento_24h: true,
      descricao: 'Monitoramento do cumprimento de medidas protetivas e socorro rápido.',
    },
    {
      id: 'srv-4',
      nome: 'NUDEM - Defensoria Pública do Paraná',
      tipo: 'Assistência Jurídica Gratuita',
      telefone: '(43) 3378-0140',
      endereco: 'Av. Duque de Caxias, 635 - Londrina - PR',
      atendimento_24h: false,
      descricao: 'Orientação jurídica, divórcio, pensão alimentícia e guarda de filhos.',
    },
    {
      id: 'srv-5',
      nome: 'Ligue 180 - Central Nacional de Atendimento',
      tipo: 'Governo Federal / Ministério das Mulheres',
      telefone: '180',
      endereco: 'Ligação gratuita em todo o território nacional',
      atendimento_24h: true,
      descricao: 'Orientações, denúncias anônimas e encaminhamento para redes locais.',
    },
    {
      id: 'srv-6',
      nome: '190 - Polícia Militar',
      tipo: 'Emergência Policial Imediata',
      telefone: '190',
      endereco: 'Socorro emergencial imediato',
      atendimento_24h: true,
      descricao: 'Acione imediatamente se houver risco físico ou agressão em andamento.',
    },
  ],
};

export const ocorrenciasSlice = createSlice({
  name: 'ocorrencias',
  initialState,
  reducers: {
    adicionarOcorrencia: (state, action) => {
      state.ocorrencias.unshift(action.payload);
    },
    removerOcorrencia: (state, action) => {
      state.ocorrencias = state.ocorrencias.filter((oc) => oc.id !== action.payload);
    },
    adicionarEvidencia: (state, action) => {
      const { ocorrenciaId, evidencia } = action.payload;
      const ocorrencia = state.ocorrencias.find((oc) => oc.id === ocorrenciaId);
      if (ocorrencia) {
        if (!ocorrencia.evidencias) ocorrencia.evidencias = [];
        ocorrencia.evidencias.push(evidencia);
      }
    },
    adicionarContato: (state, action) => {
      state.contatos.push(action.payload);
    },
    removerContato: (state, action) => {
      state.contatos = state.contatos.filter((ct) => ct.id !== action.payload);
    },
    alternarPrioridadeContato: (state, action) => {
      const id = action.payload;
      state.contatos.forEach((ct) => {
        ct.prioridade = ct.id === id ? !ct.prioridade : false;
      });
    },
  },
});

export const {
  adicionarOcorrencia,
  removerOcorrencia,
  adicionarEvidencia,
  adicionarContato,
  removerContato,
  alternarPrioridadeContato,
} = ocorrenciasSlice.actions;

export default ocorrenciasSlice.reducer;
