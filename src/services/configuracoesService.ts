export const MOEDAS_SUPORTADAS = {
  BRL: { codigo: 'BRL', nome: 'Real brasileiro', simbolo: 'R$', localidade: 'pt-BR' },
  USD: { codigo: 'USD', nome: 'Dólar americano', simbolo: 'US$', localidade: 'en-US' },
  EUR: { codigo: 'EUR', nome: 'Euro', simbolo: '€', localidade: 'de-DE' },
} as const;

export type CodigoMoeda = keyof typeof MOEDAS_SUPORTADAS;

export type PreferenciasLembretes = {
  ativo: boolean;
  pagamentos: string;
  atendimentos: string;
  lembretes: string;
};

export type Cotacao = {
  taxa: number;
  atualizadaEm: string;
  fonte: 'Frankfurter';
};

export type ConfiguracoesLocais = {
  moeda: CodigoMoeda;
  lembretes: PreferenciasLembretes;
  cotacoes: Partial<Record<Exclude<CodigoMoeda, 'BRL'>, Cotacao>>;
};

const CHAVE_CONFIGURACOES = 'configuracoes';

const CONFIGURACOES_PADRAO: ConfiguracoesLocais = {
  moeda: 'BRL',
  lembretes: {
    ativo: true,
    pagamentos: '1',
    atendimentos: '1',
    lembretes: '1',
  },
  cotacoes: {},
};

export function obterConfiguracoes(): ConfiguracoesLocais {
  if (typeof window === 'undefined') return CONFIGURACOES_PADRAO;

  try {
    const dados = localStorage.getItem(CHAVE_CONFIGURACOES);
    if (!dados) return CONFIGURACOES_PADRAO;

    const configuracoes = JSON.parse(dados) as Partial<ConfiguracoesLocais>;
    const moeda = configuracoes.moeda;

    return {
      moeda: moeda && moeda in MOEDAS_SUPORTADAS ? moeda : 'BRL',
      lembretes: {
        ...CONFIGURACOES_PADRAO.lembretes,
        ...configuracoes.lembretes,
      },
      cotacoes: configuracoes.cotacoes ?? {},
    };
  } catch {
    return CONFIGURACOES_PADRAO;
  }
}

export function salvarConfiguracoes(configuracoes: ConfiguracoesLocais): void {
  localStorage.setItem(CHAVE_CONFIGURACOES, JSON.stringify(configuracoes));
  window.dispatchEvent(new Event('configuracoes-atualizadas'));
}

export function obterMoedaSistema(): CodigoMoeda {
  return obterConfiguracoes().moeda;
}

/**
 * Busca a cotação atual tendo o real como moeda de origem.
 * A API retorna uma taxa de referência diária; não é usada para alterar dados
 * persistidos, apenas para exibir a conversão escolhida pelo usuário.
 */
export async function atualizarCotacao(moeda: CodigoMoeda): Promise<Cotacao | null> {
  if (moeda === 'BRL') return null;

  const resposta = await fetch(
    `https://api.frankfurter.dev/v2/rate/brl/${moeda.toLowerCase()}`
  );

  if (!resposta.ok) {
    throw new Error('Não foi possível atualizar a cotação.');
  }

  const dados = (await resposta.json()) as { rate?: number };

  if (!dados.rate || !Number.isFinite(dados.rate)) {
    throw new Error('A cotação recebida é inválida.');
  }

  return {
    taxa: dados.rate,
    atualizadaEm: new Date().toISOString(),
    fonte: 'Frankfurter',
  };
}

export async function salvarMoedaComCotacao(
  moeda: CodigoMoeda,
  lembretes: PreferenciasLembretes
): Promise<ConfiguracoesLocais> {
  const configuracoesAtuais = obterConfiguracoes();
  const cotacao = await atualizarCotacao(moeda);
  const cotacoes = { ...configuracoesAtuais.cotacoes };

  if (cotacao && moeda !== 'BRL') {
    cotacoes[moeda] = cotacao;
  }

  const configuracoes = { moeda, lembretes, cotacoes };
  salvarConfiguracoes(configuracoes);
  return configuracoes;
}

export function formatarMoeda(valor: number | string): string {
  const valorNumerico = Number(valor) || 0;
  const configuracoes = obterConfiguracoes();
  const codigoMoeda = configuracoes.moeda;
  const cotacao = codigoMoeda === 'BRL'
    ? 1
    : configuracoes.cotacoes[codigoMoeda]?.taxa;

  // Sem uma cotação válida, preservamos a exibição em real e nunca mostramos
  // um valor incorreto usando o símbolo de outra moeda.
  const moeda = MOEDAS_SUPORTADAS[cotacao ? codigoMoeda : 'BRL'];

  return new Intl.NumberFormat(moeda.localidade, {
    style: 'currency',
    currency: moeda.codigo,
  }).format(valorNumerico * (cotacao ?? 1));
}

export function exportarDadosLocais(): void {
  const dados = Object.fromEntries(
    Object.keys(localStorage).map((chave) => [chave, localStorage.getItem(chave)])
  );
  const arquivo = new Blob([JSON.stringify(dados, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');

  link.href = url;
  link.download = `autonomo-mais-dados-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
