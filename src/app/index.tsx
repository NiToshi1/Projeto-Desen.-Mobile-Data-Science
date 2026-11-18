import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CalendarioMesScreen from '../screens/disfarce/CalendarioMesScreen';
import EspacoSeguroScreen from '../screens/seguro/EspacoSeguroScreen';
import { carregarEspacoSeguro, carregarEventos } from '../store';

export default function HomeScreen() {
  const dispatch = useDispatch<any>();
  const estaAutenticado = useSelector((state: any) => state.auth.estaAutenticado);

  // Disfarce: a agenda é carregada da API ao abrir o app.
  useEffect(() => {
    dispatch(carregarEventos());
  }, [dispatch]);

  // Espaço Seguro: só busca dados sensíveis depois da entrada.
  useEffect(() => {
    if (estaAutenticado) dispatch(carregarEspacoSeguro());
  }, [estaAutenticado, dispatch]);

  if (estaAutenticado) {
    return <EspacoSeguroScreen />;
  }

  return <CalendarioMesScreen />;
}
