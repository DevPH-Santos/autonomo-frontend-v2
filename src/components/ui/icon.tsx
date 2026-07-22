import { refresh } from 'next/cache';
import type { CSSProperties } from 'react';

export const icons = {
  add: 'add',
  add_circle: 'add_circle',
  add_notes: 'add_notes',
  assignment: 'assignment',
  atendimentos: 'atendimentos',
  calendar_today: 'calendar_today',
  cart: 'cart',
  chevron_left: 'chevron_left',
  chevron_right: 'chevron_right',
  clients: 'clients',
  close: 'close',
  dashboard: 'dashboard',
  delete: 'delete',
  despesas: 'despesas',
  download: 'download',
  edit: 'edit',
  event: 'event',
  filter: 'filter',
  imprimir: 'imprimir',
  info: 'info',
  logout: 'logout',
  map: 'map',
  menu: 'menu',
  notifications: 'notifications',
  payments: 'payments',
  pending_payments: 'pending_payments',
  person: 'person',
  person_add: 'person_add',
  person_search: 'person_search',
  products: 'products',
  products_check: 'products_check',
  refresh: 'refresh',
  save: 'save',
  science: 'science',
  search: 'search',
  settings: 'settings',
  sucess: 'sucess',
  trending_down: 'trending_down',
  trending_flat: 'trending_flat',
  trending_up: 'trending_up',
  visibility: 'visibility',
  wallet: 'wallet',
  warning: 'warning',

  account_balance_wallet: 'wallet',
  account_circle: 'person',
  arrow_back: 'chevron_left',
  check_circle: 'sucess',
  clientes: 'clients',
  contacts_product: 'clients',
  error: 'warning',
  event_available: 'atendimentos',
  expand_more: 'chevron_right',
  filter_list: 'filter',
  inventory_2: 'products',
  lembretes: 'add_notes',
  pagamentos: 'payments',
  pending_actions: 'pending_payments',
  print: 'imprimir',
  produtos: 'products',
  receipt_long: 'despesas',
  schedule: 'pending_payments',
  success: 'sucess',
  inventory: 'products',
  search_off: 'search',
  shopping_cart: 'cart',
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const file = icons[name];

  return (
    <span
      aria-hidden="true"
      className={`inline-block h-5 w-5 bg-current align-[-0.125em] ${className}`}
      style={
        {
          mask: `url(/icons/${file}.svg) center / contain no-repeat`,
          WebkitMask: `url(/icons/${file}.svg) center / contain no-repeat`,
        } as CSSProperties
      }
    />
  );
}
