import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calcularApi, getBandeiraVigente, CalcularApiResult } from './api';
import { bandeiraVigente } from './bandeiraVigente';

import logoVoltera from './assets/figma/header/logo-voltera.svg';
import chevronDown from './assets/figma/header/chevron-down.svg';
import iconAreaCliente from './assets/figma/header/icon-area-cliente.svg';

import logoVolteraWhite from './assets/figma/footer/logo-voltera-white.svg';
import socialFacebook from './assets/figma/footer/social-facebook.svg';
import socialInstagram from './assets/figma/footer/social-instagram.svg';
import socialLinkedin from './assets/figma/footer/social-linkedin.svg';
import socialYoutube from './assets/figma/footer/social-youtube.svg';
import certBcorp from './assets/figma/footer/cert-bcorp.svg';
import certAneel from './assets/figma/footer/cert-aneel.svg';
import certCcee from './assets/figma/footer/cert-ccee.png';


import iconDistribuidora from './assets/figma/cards/icon-distribuidora.svg';
import iconDistribuidoraInstrucao from './assets/figma/cards/icon-distribuidora-instrucao.svg';
import iconClassificacao from './assets/figma/cards/icon-classificacao.svg';
import iconDinheiro from './assets/figma/cards/icon-dinheiro.svg';
import iconBandeira from './assets/figma/cards/icon-bandeira.svg';
import iconEconomia from './assets/figma/cards/icon-economia.svg';
import iconEconomiaInstrucao from './assets/figma/cards/icon-economia-instrucao.svg';

import iconChart from './assets/figma/cta/icon-chart.svg';
import iconHeadset from './assets/figma/cta/icon-headset.svg';

import bandeiraVerde from './assets/figma/bandeiras/verde.svg';
import bandeiraAmarela from './assets/figma/bandeiras/amarela.svg';
import bandeiraVermelha1 from './assets/figma/bandeiras/vermelha-1.svg';
import bandeiraVermelha2 from './assets/figma/bandeiras/vermelha-2.svg';

type Page = 'home' | 'result';

/* ---------- Domain constants ---------- */

type DistribuidoraInfo = { id: number; nome: string };

type Classificacao = {
  code: string;
  label: string;
  hasDemanda: boolean;
};

const CLASSIFICACOES: Classificacao[] = [
  { code: 'B1', label: 'B1 — Residencial', hasDemanda: false },
  { code: 'B2', label: 'B2 — Rural', hasDemanda: false },
  { code: 'B3', label: 'B3 — Comercial / Serviços / Indústria', hasDemanda: false },
  { code: 'A4', label: 'A4 — Média tensão (2,3 a 25 kV)', hasDemanda: true },
  { code: 'A3', label: 'A3 — Alta tensão (30 a 44 kV)', hasDemanda: true },
  { code: 'A2', label: 'A2 — Alta tensão (88 a 138 kV)', hasDemanda: true },
  { code: 'A1', label: 'A1 — Alta tensão (≥ 230 kV)', hasDemanda: true },
];

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

type CepStatus = 'idle' | 'loading' | 'success' | 'invalid' | 'error';

type CepResult = {
  uf: string;
  localidade: string;
  distribuidoras: DistribuidoraInfo[];
};

function formatCep(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function useCepLookup(cep: string, distribuidorasPorUf: Record<string, DistribuidoraInfo[]>) {
  const [status, setStatus] = useState<CepStatus>('idle');
  const [result, setResult] = useState<CepResult | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length === 0) {
      setStatus('idle');
      setResult(null);
      return;
    }
    if (digits.length < 8) {
      setStatus('idle');
      setResult(null);
      return;
    }

    const id = ++requestId.current;
    setStatus('loading');

    fetch(`https://viacep.com.br/ws/${digits}/json/`)
      .then((r) => r.json() as Promise<ViaCepResponse>)
      .then((data) => {
        if (id !== requestId.current) return;
        if (data.erro || !data.uf) {
          setStatus('invalid');
          setResult(null);
          return;
        }
        const uf = data.uf.toUpperCase();
        setResult({
          uf,
          localidade: data.localidade ?? '',
          distribuidoras: distribuidorasPorUf[uf] ?? [],
        });
        setStatus('success');
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setStatus('error');
        setResult(null);
      });
  }, [cep, distribuidorasPorUf]);

  return { status, result };
}

/* ---------- Inline icon library (apenas glifos sem asset oficial) ---------- */

const Icon = {
  ChevronLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Minus: () => (
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 9h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
  Doc: () => (
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M5 2h6l3 3v9a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 14V3.5A1.5 1.5 0 0 1 5 2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M11 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 9h6M6 12h6M6 6h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
};

const BANDEIRA_ASSETS: Record<'verde' | 'amarela' | 'vermelha-1' | 'vermelha-2', string> = {
  verde: bandeiraVerde,
  amarela: bandeiraAmarela,
  'vermelha-1': bandeiraVermelha1,
  'vermelha-2': bandeiraVermelha2,
};

function BandeiraIcon({ variant }: { variant: keyof typeof BANDEIRA_ASSETS }) {
  return (
    <img
      src={BANDEIRA_ASSETS[variant]}
      alt=""
      aria-hidden="true"
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  );
}

/* ---------- Routing ---------- */

function usePage() {
  const readPageFromHash = (): Page => (window.location.hash === '#resultado' ? 'result' : 'home');
  const [page, setPage] = useState<Page>(readPageFromHash);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const onHashChange = () => setPage(readPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Salta para o topo quando troca de página, mas sem smooth-scroll que cria a sensação de travado.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [page]);

  const goHome = useCallback(() => {
    if (window.location.hash === '#resultado') {
      window.location.hash = '';
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  const goResult = useCallback(() => {
    if (window.location.hash !== '#resultado') {
      window.location.hash = '#resultado';
    }
  }, []);

  // Scroll para uma seção da home; se estiver no resultado, navega antes e rola depois do render.
  const goSection = useCallback(
    (sectionId: string) => {
      const scroll = () => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      if (page === 'result') {
        window.location.hash = '';
        // espera o re-render da home antes de rolar
        requestAnimationFrame(() => requestAnimationFrame(scroll));
      } else {
        scroll();
      }
    },
    [page],
  );

  return { page, goHome, goResult, goSection };
}

/* ---------- Header ---------- */

function NavDropdown({ label, items }: { label: string; items: { text: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="nav__item" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} className={open ? 'nav__active' : ''}>
        {label}
        <img
          src={chevronDown}
          alt=""
          aria-hidden="true"
          className={`nav__chevron${open ? ' nav__chevron--up' : ''}`}
        />
      </button>
      {open && (
        <div className="nav__dropdown" role="menu">
          {items.map((item) => (
            <a
              key={item.text}
              href={item.href}
              className="nav__dropdownItem"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {item.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Header({ goSection }: { goSection: (id: string) => void }) {
  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <a href="https://voltera.com.br" className="brandButton" aria-label="Ir para a página inicial da Voltera">
          <img src={logoVoltera} alt="Voltera" className="brandLogo" />
        </a>

        <nav className="nav" aria-label="Principal">
          <a href="https://voltera.com.br/sobre-nos" className="nav__link">
            Sobre nós
          </a>
          <NavDropdown
            label="Soluções"
            items={[
              { text: 'Mercado livre de energia', href: 'https://voltera.com.br/solucoes' },
              { text: 'Parcerias', href: 'https://voltera.com.br/parcerias' },
            ]}
          />
          <a href="https://voltera.com.br/economia" className="nav__link">
            Economia
          </a>
          <NavDropdown
            label="Conteúdo"
            items={[
              { text: 'Blog', href: 'https://blog.voltera.com.br' },
              { text: 'Cálculo de Economia', href: '#inicio' },
            ]}
          />
          <a href="https://voltera.com.br/contato" className="nav__link">
            Contato
          </a>
        </nav>

        <a
          href="https://voltera.com.br/painel/login"
          className="client-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="client-link__icon">
            <img src={iconAreaCliente} alt="" aria-hidden="true" />
          </span>
          Área do cliente
        </a>
      </div>
    </header>
  );
}

/* ---------- Instructions data ---------- */

const instructionCards = [
  {
    icon: iconDistribuidoraInstrucao,
    title: 'Selecione sua distribuidora',
    description:
      'A partir do CEP, identificamos automaticamente a distribuidora responsável pelo fornecimento de energia do seu endereço.',
  },
  {
    icon: iconClassificacao,
    title: 'Escolha sua classificação',
    description:
      'Selecione entre residencial, comercial, industrial ou rural. Em caso de dúvida, escolha a mais próxima da sua atividade.',
  },
  {
    icon: iconBandeira,
    title: 'Informe o valor da conta e a bandeira',
    description:
      'Essas informações ajudam a calcular uma estimativa de economia mais precisa para a sua empresa.',
  },
  {
    icon: iconEconomiaInstrucao,
    title: 'Confira a sua economia',
    description:
      'Em poucos segundos você descobre o quanto pode economizar, em diferentes bandeiras tarifárias, nos próximos 5 anos.',
  },
];


const faqItems = [
  {
    question: 'Preciso já estar no mercado livre para fazer a simulação?',
    answer:
      'Não. A simulação é justamente para quem ainda está no mercado cativo e quer entender se vale a pena fazer a portabilidade para o mercado livre de energia.',
  },
  {
    question: 'A economia mostrada é garantida?',
    answer:
      'A simulação apresenta uma estimativa de economia com base nos dados informados e nas condições atuais de mercado. Para um valor mais preciso, nossa equipe realiza um estudo de viabilidade completo do seu perfil de consumo.',
  },
  {
    question: 'O que acontece depois que eu fizer a simulação?',
    answer:
      'Após a simulação, nossa equipe pode entrar em contato para apresentar o estudo mais detalhado, explicar como funciona a portabilidade e tirar dúvidas sobre o mercado livre de energia.',
  },
  {
    question: 'Fazer a portabilidade para o mercado livre é complicado?',
    answer:
      'Não. A Voltera cuida de todo o processo de portabilidade, gestão de contratos, acompanhamento de consumo e suporte ao cliente, tornando o processo simples e seguro para a empresa.',
  },
  {
    question: 'Além de economizar, quais são as vantagens do mercado livre de energia?',
    answer:
      'No mercado livre, você pode negociar o preço da energia, ter previsibilidade de custos, escolher energia de fontes renováveis e ter mais controle sobre o consumo e os contratos, o que traz mais eficiência e segurança na gestão de energia.',
  },
];

/* ---------- FAQ item ---------- */

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const id = `faq-${index}`;

  return (
    <div className="faqItem">
      <button
        type="button"
        className="faqItem__question"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{question}</span>
        <span className="faqItem__toggle" aria-hidden="true">
          {open ? <Icon.Minus /> : <Icon.Plus />}
        </span>
      </button>
      {open ? (
        <p id={id} className="faqItem__answer">
          {answer}
        </p>
      ) : null}
    </div>
  );
}

/* ---------- Calculation ---------- */

type BandeiraVariant = 'verde' | 'amarela' | 'vermelha-1' | 'vermelha-2';

const BANDEIRA_KEY: Record<string, BandeiraVariant> = {
  Verde: 'verde',
  Amarela: 'amarela',
  'Vermelha 1': 'vermelha-1',
  'Vermelha 2': 'vermelha-2',
};

const BASE_VALOR = 600;

const BASE_MONTHLY_SAVINGS: Record<BandeiraVariant, number> = {
  verde: 46.92,
  amarela: 67.55,
  'vermelha-1': 95.76,
  'vermelha-2': 133.12,
};

// Annual savings per bandeira [verde, amarela, vermelha-1, vermelha-2] calibrated for valor=R$600
const BASE_YEARLY_BARS: [number, number, number, number][] = [
  [350, 720, 1100, 1450],
  [450, 940, 1480, 1920],
  [520, 1100, 1720, 2240],
  [580, 1240, 1930, 2520],
  [670, 1440, 2240, 2920],
];

const PROJECTION_YEARS = ['2027', '2028', '2029', '2030', '2031'];

interface CalcResult {
  monthlyCards: Array<{ label: string; value: string; icon: string; accent: boolean; highlight: boolean }>;
  tariffCards: Array<{ label: string; value: string; variant: BandeiraVariant }>;
  yearlyData: Array<{ year: string; bars: [number, number, number, number] }>;
}

function parseMoney(str: string): number {
  const n = parseFloat(str.replace(/[R$\s.]/g, '').replace(',', '.'));
  return isNaN(n) || n <= 0 ? BASE_VALOR : n;
}

function maskCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return (num / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function computeResult(valorStr: string, bandeira: string): CalcResult {
  const valorNum = parseMoney(valorStr);
  const scale = valorNum / BASE_VALOR;
  const bandeiraKey = BANDEIRA_KEY[bandeira] ?? 'verde';

  const monthlySavings = BASE_MONTHLY_SAVINGS[bandeiraKey] * scale;
  const valorVoltera = valorNum - monthlySavings;
  const pct = Math.round((monthlySavings / valorNum) * 100);

  return {
    monthlyCards: [
      { label: 'Sua conta de luz hoje', value: fmtBRL(valorNum), icon: iconDistribuidora, accent: false, highlight: false },
      { label: 'Sua conta de luz com a Voltera', value: fmtBRL(valorVoltera), icon: iconEconomia, accent: false, highlight: true },
      { label: 'Economia média', value: `${pct}%`, icon: iconDinheiro, accent: true, highlight: false },
    ],
    tariffCards: sortedTariffCards(
      bandeiraKey,
      (v) => fmtBRL(BASE_MONTHLY_SAVINGS[v] * scale),
    ),
    yearlyData: BASE_YEARLY_BARS.map((bars, i) => ({
      year: PROJECTION_YEARS[i],
      bars: bars.map((b) => Math.round(b * scale)) as [number, number, number, number],
    })),
  };
}

const TARIFF_CARDS_BASE: Array<{ label: string; variant: BandeiraVariant }> = [
  { label: 'Em bandeira verde', variant: 'verde' },
  { label: 'Em bandeira amarela', variant: 'amarela' },
  { label: 'Em bandeira vermelha 1', variant: 'vermelha-1' },
  { label: 'Em bandeira vermelha 2', variant: 'vermelha-2' },
];

function sortedTariffCards(
  selected: BandeiraVariant,
  getValue: (v: BandeiraVariant) => string,
): CalcResult['tariffCards'] {
  const ordered = [
    ...TARIFF_CARDS_BASE.filter((c) => c.variant === selected),
    ...TARIFF_CARDS_BASE.filter((c) => c.variant !== selected),
  ];
  return ordered.map((c) => ({ ...c, value: getValue(c.variant) }));
}

function apiResultToCalcResult(api: CalcularApiResult): CalcResult {
  const { bandeira_selecionada, valor_conta, economias_por_bandeira, projecao_anual } = api;
  const sel = economias_por_bandeira[bandeira_selecionada];
  const valorVoltera = valor_conta - sel.economia_mensal;

  return {
    monthlyCards: [
      { label: 'Sua conta de luz hoje', value: fmtBRL(valor_conta), icon: iconDistribuidora, accent: false, highlight: false },
      { label: 'Sua conta de luz com a Voltera', value: fmtBRL(valorVoltera), icon: iconEconomia, accent: false, highlight: true },
      { label: 'Economia média', value: `${Math.round(sel.percentual_economia)}%`, icon: iconDinheiro, accent: true, highlight: false },
    ],
    tariffCards: sortedTariffCards(
      bandeira_selecionada as BandeiraVariant,
      (v) => fmtBRL(economias_por_bandeira[v].economia_mensal),
    ),
    yearlyData: projecao_anual.map(({ ano, economias }) => ({
      year: ano,
      bars: [
        economias.verde,
        economias.amarela,
        economias['vermelha-1'],
        economias['vermelha-2'],
      ] as [number, number, number, number],
    })),
  };
}

/* ---------- Home page ---------- */

function HomePage({
  goResult,
  distribuidorasPorUf,
}: {
  goResult: (result: CalcResult) => void;
  distribuidorasPorUf: Record<string, DistribuidoraInfo[]>;
}) {
  const [cep, setCep] = useState('');
  const [distribuidora, setDistribuidora] = useState<DistribuidoraInfo | null>(null);
  const [classificacao, setClassificacao] = useState<string>(CLASSIFICACOES[0].code);
  const [demanda, setDemanda] = useState('');
  const [valor, setValor] = useState('');
  const [bandeira, setBandeira] = useState<string>(() => bandeiraVigente());
  useEffect(() => {
    getBandeiraVigente().then(setBandeira).catch(() => {});
  }, []);

  const { status: cepStatus, result: cepResult } = useCepLookup(cep, distribuidorasPorUf);

  // Quando o lookup do CEP retorna, escolhe a primeira distribuidora do estado por padrão.
  useEffect(() => {
    if (cepResult && cepResult.distribuidoras.length > 0) {
      setDistribuidora((current) =>
        current && cepResult.distribuidoras.some((d) => d.id === current.id)
          ? current
          : cepResult.distribuidoras[0],
      );
    } else if (cepStatus === 'idle' || cepStatus === 'invalid') {
      setDistribuidora(null);
    }
  }, [cepResult, cepStatus]);

  const classeAtual = useMemo(
    () => CLASSIFICACOES.find((c) => c.code === classificacao) ?? CLASSIFICACOES[0],
    [classificacao],
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cepStatus !== 'success' || distribuidora === null) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const apiResult = await calcularApi({
        distribuidora_id: distribuidora.id,
        classificacao: classificacao as 'B1' | 'B2' | 'B3' | 'A4' | 'A3a' | 'A3' | 'A2' | 'A1',
        valor_conta: parseMoney(valor),
        bandeira: BANDEIRA_KEY[bandeira] ?? 'verde',
        uf: cepResult!.uf,
        ...(classeAtual.hasDemanda && demanda ? { demanda_kw: parseFloat(demanda) } : {}),
      });
      goResult(apiResultToCalcResult(apiResult));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao calcular. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const cepHint = (() => {
    switch (cepStatus) {
      case 'loading':
        return <span className="field__hint">Buscando distribuidora…</span>;
      case 'invalid':
        return <span className="field__hint field__hint--error">CEP não encontrado. Verifique e tente novamente.</span>;
      case 'error':
        return <span className="field__hint field__hint--error">Não foi possível consultar o CEP agora.</span>;
      case 'success':
        return cepResult ? (
          <span className="field__hint">
            {cepResult.localidade ? `${cepResult.localidade} – ${cepResult.uf}` : cepResult.uf}
          </span>
        ) : null;
      default:
        return null;
    }
  })();

  const canSubmit = cepStatus === 'success' && distribuidora !== null && Boolean(valor) && (!classeAtual.hasDemanda || Boolean(demanda)) && !submitting;

  return (
    <main className="container main">
      <section className="intro" id="sobre">
        <h2>Calcule quanto você pode economizar na conta de luz com a Voltera</h2>
        <div className="intro__rule" aria-hidden="true" />
        <p>Simule gratuitamente e sem compromisso. O resultado leva menos de 1 minuto!</p>
      </section>

      <section className="homeSplit" id="solucoes" aria-label="Simulador de economia">
        <div className="instructionRail" aria-label="Como funciona">
          {instructionCards.map((card) => (
            <article className="instructionCard" key={card.title}>
              <div className="instructionCard__icon" aria-hidden="true">
                <img src={card.icon} alt="" />
              </div>
              <div className="instructionCard__body">
                <strong>{card.title}</strong>
                <p>{card.description}</p>
              </div>
            </article>
          ))}
        </div>

        <form className="simulationForm" onSubmit={onSubmit} aria-label="Formulário de cálculo de economia">
          <label className="field" htmlFor="cep">
            <span>
              Insira o seu CEP<span className="field__required">*</span>
            </span>
            <input
              id="cep"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="Insira o seu CEP"
              value={cep}
              onChange={(e) => setCep(formatCep(e.target.value))}
              maxLength={9}
              required
              aria-invalid={cepStatus === 'invalid'}
            />
            {cepHint}
          </label>

          {cepStatus === 'success' && cepResult && cepResult.distribuidoras.length > 1 ? (
            <label className="field" htmlFor="distribuidora">
              <span>
                Distribuidora<span className="field__required">*</span>
              </span>
              <select
                id="distribuidora"
                value={distribuidora?.id ?? ''}
                onChange={(e) => {
                  const found = cepResult.distribuidoras.find((d) => String(d.id) === e.target.value);
                  setDistribuidora(found ?? null);
                }}
                required
              >
                {cepResult.distribuidoras.map((d) => (
                  <option key={d.id} value={d.id}>{d.nome}</option>
                ))}
              </select>
              <span className="field__hint">Identificamos mais de uma distribuidora na sua região. Verifique se selecionamos a correta!</span>
            </label>
          ) : cepStatus === 'success' && distribuidora ? (
            <div className="field field--readonly" aria-live="polite">
              <span>Distribuidora identificada</span>
              <div className="field__readonlyValue">{distribuidora.nome}</div>
            </div>
          ) : null}

          <label className="field" htmlFor="classificacao">
            <span>
              Selecione sua classificação<span className="field__required">*</span>
            </span>
            <select
              id="classificacao"
              value={classificacao}
              onChange={(e) => {
                setClassificacao(e.target.value);
                const next = CLASSIFICACOES.find((c) => c.code === e.target.value);
                if (!next?.hasDemanda) setDemanda('');
              }}
              required
            >
              {CLASSIFICACOES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          {classeAtual.hasDemanda ? (
            <label className="field" htmlFor="demanda">
              <span>
                Demanda contratada (kW)<span className="field__required">*</span>
              </span>
              <input
                id="demanda"
                type="number"
                min={0}
                step="0.01"
                value={demanda}
                onChange={(e) => setDemanda(e.target.value)}
                placeholder="Ex.: 150"
                required
              />
              <span className="field__hint">Você encontra essa informação na sua fatura, em demanda.</span>
            </label>
          ) : null}

          <label className="field" htmlFor="valor">
            <span>
              Valor da sua conta de luz<span className="field__required">*</span>
            </span>
            <input
              id="valor"
              type="text"
              inputMode="numeric"
              value={valor}
              onChange={(e) => setValor(maskCurrency(e.target.value))}
              required
              placeholder="R$ 0,00"
            />
          </label>

          <label className="field" htmlFor="bandeira">
            <span>Bandeira tarifária</span>
            <select id="bandeira" value={bandeira} onChange={(e) => setBandeira(e.target.value)}>
              <option>Verde</option>
              <option>Amarela</option>
              <option>Vermelha 1</option>
              <option>Vermelha 2</option>
            </select>
          </label>

          <button type="submit" className="primaryButton" disabled={!canSubmit}>
            {submitting ? 'Calculando…' : 'Calcular minha economia agora'}
          </button>
          {!canSubmit && cepStatus === 'idle' && !submitting ? (
            <span className="primaryHint">Informe seu CEP para liberar o cálculo.</span>
          ) : null}
          {submitError ? (
            <span className="primaryHint primaryHint--error">{submitError}</span>
          ) : null}
        </form>
      </section>


      <section className="faq" id="conteudo" aria-label="Perguntas frequentes">
        <h2>Ainda tem dúvidas?</h2>
        <div className="faq__list">
          {faqItems.map((item, index) => (
            <FAQItem key={item.question} question={item.question} answer={item.answer} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

/* ---------- Result page ---------- */

const CHART_H = 240;

function AnnualChart({ yearlyData, tariffCards }: Pick<CalcResult, 'yearlyData' | 'tariffCards'>) {
  const maxBar = Math.max(...yearlyData.flatMap((g) => g.bars));
  const rawStep = maxBar / 6;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const yMax = Math.ceil(maxBar / step) * step;
  const yLabels: number[] = [];
  for (let v = yMax; v >= 0; v -= step) yLabels.push(v);

  return (
    <div className="chart" aria-label="Projeção de economia anual">
      <div className="chart__yLabels" aria-hidden="true">
        {yLabels.map((v) => (
          <span key={v}>{`R$ ${v.toLocaleString('pt-BR')}`}</span>
        ))}
      </div>
      <div className="chart__plot">
        <div className="chart__grid">
          {yearlyData.map((g) => (
            <div className="chart__group" key={g.year}>
              <div
                className="chart__bar chart__bar--verde"
                style={{ height: `${(g.bars[0] / yMax) * CHART_H}px` }}
                data-value={fmtBRL(g.bars[0])}
              />
              <div
                className="chart__bar chart__bar--amarela"
                style={{ height: `${(g.bars[1] / yMax) * CHART_H}px` }}
                data-value={fmtBRL(g.bars[1])}
              />
              <div
                className="chart__bar chart__bar--vermelha-1"
                style={{ height: `${(g.bars[2] / yMax) * CHART_H}px` }}
                data-value={fmtBRL(g.bars[2])}
              />
              <div
                className="chart__bar chart__bar--vermelha-2"
                style={{ height: `${(g.bars[3] / yMax) * CHART_H}px` }}
                data-value={fmtBRL(g.bars[3])}
              />
            </div>
          ))}
        </div>
        <div className="chart__xLabels">
          {yearlyData.map((g) => (
            <span key={g.year}>{g.year}</span>
          ))}
        </div>
        <div className="chart__legend">
          {tariffCards.map((t) => (
            <span className="chart__legendItem" key={t.label}>
              <span className="chart__legendIcon">
                <BandeiraIcon variant={t.variant} />
              </span>
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultPage({ result }: { result: CalcResult | null }) {
  const { monthlyCards, tariffCards, yearlyData } = result ?? computeResult('R$ 600,00', 'Verde');
  return (
    <main className="container main">
      <section className="intro" id="inicio">
        <h1>Resultado da sua economia com a Voltera</h1>
        <div className="intro__rule" aria-hidden="true" />
        <p>Aqui está o seu potencial de economia com a Voltera:</p>
      </section>

      <section className="resultGrid" aria-label="Resumo de economia">
        <article className="panel">
          <h2>Economia mensal</h2>
          {monthlyCards.map((c) => (
            <div
              key={c.label}
              className={`statCard${c.highlight ? ' statCard--highlight' : ''}${c.accent ? ' statCard--accent' : ''}`}
            >
              <div className="statCard__left">
                <div className="statCard__icon" aria-hidden="true">
                  <img src={c.icon} alt="" />
                </div>
                <div className="statCard__label">{c.label}</div>
              </div>
              <div className="statCard__value">{c.value}</div>
            </div>
          ))}
        </article>

        <article className="panel">
          <h2>Economia por bandeira tarifária</h2>
          {tariffCards.map((t) => (
            <div key={t.label} className="tariffCard">
              <div className="tariffCard__left">
                <span className="tariffCard__flag">
                  <BandeiraIcon variant={t.variant} />
                </span>
                <span className="tariffCard__label">{t.label}</span>
              </div>
              <span className="tariffCard__value">{t.value}</span>
            </div>
          ))}
        </article>
      </section>

      <section className="annual">
        <h2>Economia anual</h2>
        <p>Quanto você pode economizar nos próximos 5 anos em diferentes bandeiras de energia.</p>
        <AnnualChart yearlyData={yearlyData} tariffCards={tariffCards} />
      </section>

      <section className="cta" aria-labelledby="cta-title">
        <div>
          <h2 id="cta-title" className="cta__title">
            Quer receber um estudo completo de economia?
          </h2>
          <div className="cta__rule" aria-hidden="true" />
          <p className="cta__text">
            Nossa equipe pode fazer uma análise detalhada e explicar como funciona a portabilidade para o mercado livre
            de energia.
          </p>
        </div>
        <div className="cta__actions">
          <a
            href="https://voltera.com.br/cadastro/usuario/novo"
            target="_blank"
            rel="noopener noreferrer"
            className="cta__button"
          >
            <span className="cta__buttonIcon">
              <img src={iconChart} alt="" aria-hidden="true" />
            </span>
            Solicitar estudo personalizado
          </a>
          <a
            href="https://api.whatsapp.com/send/?phone=5511917769453&text=Ol%C3%A1%21+Quero+saber+como+minha+empresa+pode+economizar+na+conta+de+energia+com+a+Voltera.&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="cta__button"
          >
            <span className="cta__buttonIcon">
              <img src={iconHeadset} alt="" aria-hidden="true" />
            </span>
            Falar com um especialista agora
          </a>
        </div>
      </section>
    </main>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="container footer__inner">
        <img src={logoVolteraWhite} alt="Voltera" className="footer__logo" />

        <div className="footer__body">
          <div className="footer__info">
            <div className="footer__social" aria-label="Redes sociais">
              <a className="footer__socialLink" href="https://www.linkedin.com/company/voltera-energia" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <img src={socialLinkedin} alt="" aria-hidden="true" />
              </a>
              <a className="footer__socialLink" href="https://www.instagram.com/voltera_energia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <img src={socialInstagram} alt="" aria-hidden="true" />
              </a>
              <a className="footer__socialLink" href="https://www.youtube.com/@voltera_energia" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <img src={socialYoutube} alt="" aria-hidden="true" />
              </a>
              <a className="footer__socialLink" href="https://www.facebook.com/voltera.energia" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <img src={socialFacebook} alt="" aria-hidden="true" />
              </a>
            </div>
            <div className="footer__address">
              <span>Avenida Rebouças, 3.507 | São Paulo, SP</span>
              <span>CNPJ: 35.552.880/0001-93</span>
            </div>
            <div className="footer__legal">
              <a className="footer__legalLink" href="https://voltera.com.br/_app/immutable/assets/termo-de-adesao-voltera-energia.GDl3jRDa.pdf" target="_blank" rel="noopener noreferrer">
                <Icon.Doc /> Termo de adesão
              </a>
              <a className="footer__legalLink" href="https://voltera.com.br/_app/immutable/assets/politica-de-privacidade-voltera-energia.B7WXR-8R.pdf" target="_blank" rel="noopener noreferrer">
                <Icon.Doc /> Política de privacidade
              </a>
              <a className="footer__legalLink" href="https://blog.voltera.com.br/termos-voltera-varejista/" target="_blank" rel="noopener noreferrer">
                <Icon.Doc /> Termos Voltera varejista
              </a>
            </div>
          </div>

          <a href="https://www.bcorporation.net" target="_blank" rel="noopener noreferrer" className="footer__certBlock">
            <img src={certBcorp} alt="Empresa Certificada B Corporation" className="footer__cert footer__cert--bcorp" />
          </a>

          <div className="footer__certBlock">
            <a href="https://www.gov.br/aneel" target="_blank" rel="noopener noreferrer">
              <img src={certAneel} alt="ANEEL" className="footer__cert footer__cert--aneel" />
            </a>
            <span>Regulado e autorizado</span>
          </div>

          <div className="footer__certBlock">
            <a href="https://www.ccee.org.br" target="_blank" rel="noopener noreferrer">
              <img src={certCcee} alt="CCEE" className="footer__cert footer__cert--ccee" />
            </a>
            <span>Membro e agente habilitado.</span>
            <span>Fator de alavancagem CCEE: 0,00.</span>
          </div>
        </div>

        <div className="footer__copy">© 2024 Voltera - Todos os direitos reservados.</div>
      </div>
    </footer>
  );
}

/* ---------- App ---------- */

type DistribuidorasJson = { distribuidoras: Array<{ id: number; nome: string; uf: string }> };

function useDistribuidorasPorUf() {
  const [distribuidorasPorUf, setDistribuidorasPorUf] = useState<Record<string, DistribuidoraInfo[]>>({});

  useEffect(() => {
    fetch('/distribuidoras.json')
      .then((r) => r.json() as Promise<DistribuidorasJson>)
      .then((json) => {
        const grouped: Record<string, DistribuidoraInfo[]> = {};
        for (const { id, nome, uf } of json.distribuidoras) {
          (grouped[uf] ??= []).push({ id, nome });
        }
        setDistribuidorasPorUf(grouped);
      })
      .catch(() => {
        // silently fails — useCepLookup devolve lista vazia para o UF
      });
  }, []);

  return distribuidorasPorUf;
}

export default function App() {
  const { page, goHome: _goHome, goResult: navigate, goSection } = usePage();
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const embedded = new URLSearchParams(window.location.search).get('embed') === '1';
  const distribuidorasPorUf = useDistribuidorasPorUf();

  const handleGoResult = useCallback(
    (result: CalcResult) => {
      setCalcResult(result);
      navigate();
    },
    [navigate],
  );

  return (
    <div className="page">
      {!embedded && <Header goSection={goSection} />}
      {page === 'home' ? (
        <HomePage goResult={handleGoResult} distribuidorasPorUf={distribuidorasPorUf} />
      ) : (
        <ResultPage result={calcResult} />
      )}
      {!embedded && <Footer />}
    </div>
  );
}
