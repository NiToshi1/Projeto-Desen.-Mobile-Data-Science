// Nível de perigo de uma ocorrência, de 1 (baixo) a 10 (risco extremo).
export const NIVEIS_PERIGO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function corDoPerigo(nivel) {
  if (nivel >= 9) return '#EF4444'; // crítico
  if (nivel >= 7) return '#F97316'; // alto
  if (nivel >= 4) return '#F59E0B'; // médio
  return '#10B981'; // baixo
}

export function rotuloDoPerigo(nivel) {
  if (nivel >= 9) return 'Crítico';
  if (nivel >= 7) return 'Alto';
  if (nivel >= 4) return 'Médio';
  return 'Baixo';
}

// "2026-11-19T14:30:00+00:00" -> "19/11/2026 11:30" (hora local do aparelho)
export function formatarDataHora(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dois = (n) => String(n).padStart(2, '0');
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}
