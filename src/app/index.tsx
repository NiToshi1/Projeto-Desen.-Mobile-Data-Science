import React from 'react';
import { useSelector } from 'react-redux';
import CalendarioMesScreen from '../screens/disfarce/CalendarioMesScreen';
import EspacoSeguroScreen from '../screens/seguro/EspacoSeguroScreen';

export default function HomeScreen() {
  const estaAutenticado = useSelector((state: any) => state.auth.estaAutenticado);

  if (estaAutenticado) {
    return <EspacoSeguroScreen />;
  }

  return <CalendarioMesScreen />;
}
