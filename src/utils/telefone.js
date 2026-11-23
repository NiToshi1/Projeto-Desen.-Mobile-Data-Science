import { Linking } from 'react-native';
import { alertar } from './alerta';

// Abre o discador já com o número, sem pedir confirmação (em emergência cada toque conta).
export function ligar(numero) {
  Linking.openURL(`tel:${String(numero).replace(/[^\d+]/g, '')}`).catch(() => {
    alertar('Não foi possível ligar', `Disque ${numero} no telefone do aparelho.`);
  });
}
