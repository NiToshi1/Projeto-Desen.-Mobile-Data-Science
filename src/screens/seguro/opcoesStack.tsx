import React from 'react';
import BotaoSaidaRapida from '../../components/BotaoSaidaRapida';

// Opções comuns dos Stacks do Espaço Seguro (tema escuro). O botão vermelho de
// saída rápida fica no cabeçalho de TODAS as telas: a saída precisa estar a um
// toque de qualquer lugar, sem confirmação.
export const opcoesStack = {
  headerStyle: { backgroundColor: '#0F172A' },
  headerTintColor: '#F8FAFC',
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#0F172A' },
  headerRight: () => <BotaoSaidaRapida />,
};
