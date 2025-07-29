// src/services/pontoService.mjs
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { enviarMensagemTelegram } from './telegramService.mjs';
import { DateTime } from 'luxon';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Ignora SSL inválido (não recomendado em produção)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @return [type]
 */
export async function baterPonto() {
  const validHours = ['08:23', '12:00', '12:15', '14:15'];
  const bloqueadas = ['05/05/2025', '06/05/2025', '19/06/2025', '24/09/2025'];

  const now = DateTime.now().setZone('America/Sao_Paulo');
  const dataHoje = now.toFormat('dd/MM/yyyy');
  const diaSemana = now.weekday; // 1 (segunda) a 7 (domingo)

  if (diaSemana > 7 || bloqueadas.includes(dataHoje)) return;

  let horaValida = false;

  for (const hora of validHours) {
    const [h, m] = hora.split(':').map(Number);
    const horarioAlvo = now.set({ hour: h, minute: m, second: 0, millisecond: 0 });

    const diff = Math.abs(now.diff(horarioAlvo, 'minutes').toObject().minutes);

    if (diff <= 2) {
      const currentTime = horarioAlvo.toFormat('HHmm');
      const lockFile = path.join(__dirname, `../../locks/lock_${now.toFormat('yyyy-MM-dd')}_${currentTime}.lock`);
      if (fs.existsSync(lockFile)) {
        console.log(`Já executado para ${hora}`);
        //await enviarMensagemTelegram(`Já executado para ${hora}`);
        return;
      }

      fs.writeFileSync(lockFile, 'executado');
      horaValida = true;
      break;
    }
  }

  if (!horaValida) return;

  const jar = new CookieJar();
  const client = wrapper(axios.create({
    baseURL: 'https://portalrh.totvs.com.br',
    withCredentials: true,
    jar,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Origin': 'https://portalrh.totvs.com.br',
      'Referer': 'https://portalrh.totvs.com.br/framehtml/web/app/RH/PortalMeuRH/',
      'X-Totvs-App': '0533',
      'DNT': '1',
    },
  }));

  const credentials = {
    user: process.env.USER_ID,
    password: process.env.USER_PASS
  };

  try {
    await client.post('/framehtml/rm/api/rest/auth/isFirstLoginAuthentic', credentials);
    await client.post('/framehtml/rm/api/rest/auth/login', credentials);
    await client.get('/framehtml/rm/api/rest/auth/isLogged');

    const { latitude, longitude, address } =
      diaSemana === 7
        ? {
          latitude: '-14.000000',
          longitude: '-40.000000',
          address: 'Avenida Fantomas, Park Diversão, Goiânia, GO, 74000-000, Brasil',
        }
        : {
          latitude: '-14.000000',
          longitude: '-40.000000',
          address: 'Rua Gato, Goiânia, GO, 74000-000, Brasil',
        };

    await client.get(`/framehtml/rm/api/rest/timesheet/clockingsGeolocation/currentTime/${latitude}/${longitude}/?timezone=180`);

    const agoraUTC = DateTime.now().toUTC();

    //'/framehtml/rm/api/rest/timesheet/clockingsGeolocation/%7Bcurrent%7D'
    await sleep(Math.random() * 3000);
    const response = await client.post('/framehtml/rm/api/', {
      date: agoraUTC.toISO(),
      hour: agoraUTC.toMillis(),
      latitude,
      longitude,
      timezone: 180,
      address,
    });

    if ([200, 201].includes(response.status)) {
      console.log(`✅ Ponto batido com sucesso em ${now.toFormat('dd/MM/yyyy HH:mm:ss')} — ${address}`);
      await enviarMensagemTelegram(`✅ Ponto batido com sucesso em ${now.toFormat('dd/MM/yyyy HH:mm:ss')} — ${address}`);
    } else {
      console.log(`⚠️ Erro ao bater ponto. Código: ${response.status}`);
      await enviarMensagemTelegram(`⚠️ Erro ao bater ponto. Código: ${response.status}`);
    }
  } catch (e) {
    console.log(`❌ Erro ao bater ponto: ${e.message}`);
    await enviarMensagemTelegram(`❌ Erro ao bater ponto: ${e.message}`);
  }
}