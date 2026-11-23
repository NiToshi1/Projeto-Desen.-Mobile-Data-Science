import React from 'react';
import { ScrollView } from 'react-native';
import IndicadorTerritorialCard from './IndicadorTerritorialCard';
import estilos from './estilos';

// Aba "Contexto": indicador territorial do modelo de Data Science
// (sempre acompanhado do aviso de estimativa acadêmica).
export default function ContextoScreen() {
  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <IndicadorTerritorialCard />
    </ScrollView>
  );
}
