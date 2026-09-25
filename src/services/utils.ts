import { formatarMoeda } from './configuracoesService';

export function formatCurrency(value: number) {
  return formatarMoeda(value);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
