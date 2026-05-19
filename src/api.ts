type Bandeira = 'verde' | 'amarela' | 'vermelha-1' | 'vermelha-2';
type Classificacao = 'B1' | 'B2' | 'B3' | 'A4' | 'A3a' | 'A3' | 'A2' | 'A1';

interface CalcularPayload {
  distribuidora_id: string;
  classificacao: Classificacao;
  valor_conta: number;
  bandeira: Bandeira;
  uf: string;
  demanda_kw?: number;
}

interface EconomiaBandeira {
  economia_mensal: number;
  economia_anual: number;
  percentual_economia: number;
}

export interface CalcularApiResult {
  bandeira_selecionada: Bandeira;
  valor_conta: number;
  economias_por_bandeira: Record<Bandeira, EconomiaBandeira>;
  projecao_anual: Array<{ ano: string; economias: Record<Bandeira, number> }>;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000/api';

const BANDEIRA_LABEL: Record<string, string> = {
  'verde': 'Verde',
  'amarela': 'Amarela',
  'vermelha-1': 'Vermelha 1',
  'vermelha-2': 'Vermelha 2',
};

export async function getDistribuidoras(): Promise<Record<string, { id: string; nome: string }[]>> {
  const resp = await fetch(`${API_URL}/distribuidoras`);
  if (!resp.ok) throw new Error('falha ao buscar distribuidoras');
  const data = await resp.json() as { data: Record<string, { id: string; nome: string }[]> };
  return data.data;
}

export async function getBandeiraVigente(): Promise<string> {
  const resp = await fetch(`${API_URL}/bandeira-vigente`);
  if (!resp.ok) throw new Error('falha ao buscar bandeira vigente');
  const data = await resp.json() as { bandeira: string };
  return BANDEIRA_LABEL[data.bandeira] ?? 'Verde';
}

export async function calcularApi(payload: CalcularPayload): Promise<CalcularApiResult> {
  const resp = await fetch(`${API_URL}/calcular`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (resp.status === 429) {
    throw new Error('Muitas tentativas. Aguarde 1 minuto e tente novamente.');
  }

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: 'Erro desconhecido' })) as { error?: string };
    throw new Error(body.error ?? `Erro ${resp.status}`);
  }

  return resp.json() as Promise<CalcularApiResult>;
}
