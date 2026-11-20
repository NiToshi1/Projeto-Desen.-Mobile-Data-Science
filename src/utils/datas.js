// Funções de data usadas pela agenda. Trabalham sempre com a data LOCAL
// (sem fuso), no formato AAAA-MM-DD que o banco guarda.

export const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
export const DIAS_SEMANA_CURTO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

const dois = (n) => String(n).padStart(2, '0');
const maiuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const hoje = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

export const paraIso = (d) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;

export const deIso = (s) => {
  const [a, m, d] = s.split('-').map(Number);
  return new Date(a, m - 1, d);
};

export const somarDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// Soma meses mantendo o dia, ou o último dia do mês quando ele não existe (31/jan + 1 mês = 28/fev).
export const somarMeses = (d, n) => {
  const primeiro = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const ultimoDia = new Date(primeiro.getFullYear(), primeiro.getMonth() + 1, 0).getDate();
  return new Date(primeiro.getFullYear(), primeiro.getMonth(), Math.min(d.getDate(), ultimoDia));
};

export const inicioDaSemana = (d) => somarDias(d, -d.getDay());

export const mesmoDia = (a, b) => paraIso(a) === paraIso(b);

export const tituloMes = (d) => `${maiuscula(MESES[d.getMonth()])} de ${d.getFullYear()}`;

export const rotuloDia = (d) =>
  `${maiuscula(DIAS_SEMANA_CURTO[d.getDay()])}, ${d.getDate()} de ${MESES[d.getMonth()]}`;

const abreviado = (d) => `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
export const rotuloIntervalo = (inicio, fim) => `${abreviado(inicio)} – ${abreviado(fim)}`;

// Células da grade do mês: null para os espaços antes do dia 1, depois as datas.
export const gradeDoMes = (d) => {
  const primeiro = new Date(d.getFullYear(), d.getMonth(), 1);
  const total = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const celulas = Array(primeiro.getDay()).fill(null);
  for (let dia = 1; dia <= total; dia++) celulas.push(new Date(d.getFullYear(), d.getMonth(), dia));
  return celulas;
};

export const dataValida = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return paraIso(deIso(s)) === s; // rejeita 2026-02-31
};

export const horaValida = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
