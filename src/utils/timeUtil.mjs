// src/utils/timeUtil.mjs
import moment from 'moment-timezone';

const getNow = () => moment().tz('America/Sao_Paulo');
const isDataBloqueada = (data, datasBloqueadas) => datasBloqueadas.includes(data);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


module.exports = { getNow, isDataBloqueada };
