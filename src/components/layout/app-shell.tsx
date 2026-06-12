'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/clientes', label: 'Clientes', icon: 'contacts_product' },
  { href: '/atendimentos', label: 'Atendimentos', icon: 'event_available' },
  { href: '/despesas', label: 'Despesas', icon: 'receipt_long' },
  { href: '/pagamentos', label: 'Pagamentos', icon: 'payments' },
  { href: '/produtos', label: 'Produtos', icon: 'inventory_2' },
  { href: '/lembretes', label: 'Lembretes', icon: 'add_notes' },
];

interface AppShellProps {
  children: ReactNode;
  onSearch?: (termo: string) => void;
}

export function AppShell({ children, onSearch }: Readonly<AppShellProps>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState('');
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  
  const isSettingsActive = pathname === '/configuracoes' || pathname.startsWith('/configuracoes/');

  const handleBusca = (valor: string) => {
    setBusca(valor);
    onSearch?.(valor);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* ========== SIDEBAR (DESKTOP) ========== */}
      <aside className="fixed inset-y-0 left-0 hidden lg:flex w-64 border-r border-slate-200 bg-white flex-col justify-between py-6 z-50">
        <div className="px-6 py-4 text-center border-b border-slate-200 mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Autônomo +</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Gestão de Serviços</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1 px-3 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 before:absolute before:left-0 before:w-1 before:h-6 before:bg-blue-600 before:rounded-r'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-xl shrink-0">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 border-t border-slate-200 pt-3">
          <Link
            href="/configuracoes"
            className={`relative rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-all duration-200 ${
              isSettingsActive
                ? 'text-blue-600 bg-blue-50 before:absolute before:left-0 before:w-1 before:h-6 before:bg-blue-600 before:rounded-r'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-xl shrink-0">
              settings
            </span>
            <span className="truncate">Configurações</span>
          </Link>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="lg:pl-64 pb-28 lg:pb-0">
        {/* ========== HEADER ========== */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-8">
            {/* Logo Mobile */}
            <div className="lg:hidden">
              <h2 className="text-lg font-bold text-blue-600">A+</h2>
            </div>

            {/* Campo de Busca */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busca}
                  onChange={(e) => handleBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Ações do Header */}
            <div className="flex items-center gap-3 lg:gap-4">
              <button
                className="hidden sm:flex cursor-pointer text-slate-600 hover:text-blue-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Calendário"
              >
                <span className="material-symbols-outlined">calendar_today</span>
              </button>

              <button
                className="relative cursor-pointer text-slate-600 hover:text-blue-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Notificações"
              >
                <span className="material-symbols-outlined">notifications</span>
                {/* Badge de notificações */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Perfil com Menu */}
              <div className="relative">
                <button
                  onClick={() => setMostrarPerfil(!mostrarPerfil)}
                  className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full hover:bg-blue-700 transition-colors shrink-0"
                  aria-label="Perfil"
                >
                  <span className="material-symbols-outlined text-xl">person</span>
                </button>

                {/* Menu Dropdown de Perfil */}
                {mostrarPerfil && (
                  <div
                    className="absolute top-12 right-0 w-56 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50"
                    onClick={() => setMostrarPerfil(false)}
                  >
                    {/* Header do Menu */}
                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                      <p className="font-semibold text-sm text-slate-900">João da Silva</p>
                      <p className="text-xs text-slate-500 mt-0.5">Administrador</p>
                    </div>

                    {/* Opções */}
                    <nav className="flex flex-col py-2">
                      <Link
                        href="/configuracoes"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          account_circle
                        </span>
                        Meu Perfil
                      </Link>
                      <Link
                        href="/configuracoes"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          settings
                        </span>
                        Configurações
                      </Link>
                      <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left w-full">
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sair
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ========== MAIN CONTENT ========== */}
        <main className="px-4 py-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-120px)]">
          {children}
        </main>
      </div>

      {/* ========== BOTTOM NAV (MOBILE) ========== */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm z-50 w-full">
        <ul className="flex flex-row justify-around items-stretch gap-0 px-0 py-1 list-none w-full">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href} className="flex-1 min-w-0">
                <Link
                  href={item.href}
                  className={`relative flex flex-col justify-center items-center gap-1 py-2 px-1 text-center text-[10px] font-semibold transition-all duration-200 h-full ${
                    isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {/* Barra indicadora */}
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
                  )}

                  <span className="material-symbols-outlined text-xl leading-none">
                    {item.icon}
                  </span>

                  <span className="truncate w-full px-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
