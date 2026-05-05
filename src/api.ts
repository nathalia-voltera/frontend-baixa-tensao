type Bandeira = 'verde' | 'amarela' | 'vermelha-1' | 'vermelha-2';
type Classificacao = 'B1' | 'B2' | 'B3' | 'A4' | 'A3a' | 'A3' | 'A2' | 'A1';

interface CalcularPayload {
  distribuidoraId: number;
  classificacao: Classificacao;
  valorConta: number;
  bandeira: Bandeira;
  uf: string;
}

interface EconomiaBandeira {
  economiaMensal: number;
  economiaAnual: number;
  percentualEconomia: number;
}

export interface CalcularApiResult {
  bandeiraSelecionada: Bandeira;
  valorConta: number;
  economiasPorBandeira: Record<Bandeira, EconomiaBandeira>;
  projecaoAnual: Array<{ ano: string; economias: Record<Bandeira, number> }>;
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

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

  const json = await resp.json() as { data: CalcularApiResult };
  return json.data;
}
