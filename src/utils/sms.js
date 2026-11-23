import * as SMS from 'expo-sms';
import { alertar } from './alerta';

export const MENSAGEM_PADRAO_SMS = 'Preciso de ajuda. Por favor, entre em contato comigo o mais rápido possível.';

// Abre o app de SMS do aparelho já com o texto e o número de todos os guardiões.
// O envio final é um toque da pessoa (o app nunca manda SMS escondido).
// No navegador e no simulador iOS o SMS não existe: avisa em vez de falhar calado.
export async function enviarSmsAosGuardioes(guardioes, mensagem) {
  const numeros = guardioes.map((g) => String(g.telefone).replace(/[^\d+]/g, '')).filter(Boolean);
  if (numeros.length === 0) {
    alertar('Sem guardiões', 'Cadastre pelo menos um guardião na aba Guardiões para enviar o aviso.');
    return;
  }
  if (!mensagem.trim()) {
    alertar('Mensagem vazia', 'Escreva o texto do SMS antes de enviar.');
    return;
  }
  try {
    if (!(await SMS.isAvailableAsync())) {
      alertar('SMS indisponível', 'Este aparelho não consegue enviar SMS (no navegador e no simulador do iPhone isso não funciona). Teste no celular.');
      return;
    }
    await SMS.sendSMSAsync(numeros, mensagem.trim());
  } catch {
    alertar('Não foi possível abrir o SMS', 'Envie a mensagem manualmente para os seus guardiões.');
  }
}
