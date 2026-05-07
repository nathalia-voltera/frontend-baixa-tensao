export type Bandeira = 'Verde' | 'Amarela' | 'Vermelha 1' | 'Vermelha 2';

/**
 * Bandeira tarifária publicada pela ANEEL por mês de referência.
 * Atualizar manualmente todo dia 25-30 com base em
 * https://www.aneel.gov.br/bandeiras-tarifarias
 *
 * Chave no formato 'YYYY-MM'. Se o mês atual não estiver na tabela,
 * o lookup cai no fallback configurado em FALLBACK abaixo.
 */
const HISTORICO: Record<string, Bandeira> = {
  '2025-08': 'Verde',
  '2025-09': 'Amarela',
  '2025-10': 'Vermelha 1',
  '2025-11': 'Verde',
  '2025-12': 'Verde',
  '2026-01': 'Verde',
  '2026-02': 'Verde',
  '2026-03': 'Verde',
  '2026-04': 'Verde',
  '2026-05': 'Amarela',
};

const FALLBACK: Bandeira = 'Verde';


function chave(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function bandeiraVigente(date: Date = new Date()): Bandeira {
  return HISTORICO[chave(date)] ?? FALLBACK;
}

