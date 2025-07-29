// src/services/whatsappService.mjs
import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const apiBase = 'https://waha.well.casa:3000/api';
const chatId = process.env.WHATSAPP_CHAT_ID;
const session = process.env.SESSION_ID;
const apiKey = process.env.API_KEY;
const agent = new https.Agent({ rejectUnauthorized: false });

const headers = {
  'X-Api-Key': apiKey,
  'Content-Type': 'application/json',
};

/**
 * @param mixed mensagem
 * 
 * @return [type]
 */
export async function enviarMensagemWhatsApp(mensagem) {
  const basePayload = { chatId, session };

  try {
    await axios.post(`${apiBase}/startTyping`, basePayload, { headers, httpsAgent: agent });

    await axios.post(`${apiBase}/sendText`, {
      ...basePayload,
      reply_to: null,
      text: mensagem,
      linkPreview: true,
      linkPreviewHighQuality: false,
    }, { headers, httpsAgent: agent });

    await axios.post(`${apiBase}/stopTyping`, basePayload, { headers, httpsAgent: agent });

  } catch (error) {
    console.error('[WhatsApp] Erro:', error.message);
  }
}