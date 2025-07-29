import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * @param mixed texto
 * 
 * @return [type]
 */
export async function enviarMensagemTelegram(texto) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: '999999999',
      text: texto
    });
  } catch (error) {
    console.error('[Telegram] Erro:', error.message);
  }
}
