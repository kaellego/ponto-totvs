import cron from 'node-cron';
import { agendarPonto } from './services/agendamentoService.mjs';
import { enviarMensagemTelegram } from './services/telegramService.mjs';
import { enviarMensagemWhatsApp } from './services/whatsappService.mjs';

cron.schedule('* * * * *', async () => {
  console.log('Verificando agendamento...');
  //await enviarMensagemTelegram(`Verificando agendamento...`);
  //await enviarMensagemWhatsApp(`Verificando agendamento...`);
  await agendarPonto();
});