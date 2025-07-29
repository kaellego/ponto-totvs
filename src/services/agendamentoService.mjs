import { baterPonto } from './pontoService.mjs';

/**
 * @return [type]
 */
export async function agendarPonto() {
  try {
    await baterPonto();
  } catch (error) {
    console.error('[CONSOLE] Erro no agendamento:', error);
  }
}