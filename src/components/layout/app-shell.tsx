'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/clientes', label: 'Clientes', icon: 'contacts_product' },
  { href: '/atendimentos', label: 'Atendimentos', icon: 'event_available' },
  { href: '/despesas', label: 'Despesas', icon: 'receipt_long' },
  { href: '/pagamentos', label: 'Pagamentos', icon: 'payments' },
  { href: '/produtos', label: 'Produtos', icon: 'inventory_2' },
  { href: '/lembretes', label: 'Lembretes', icon: 'add_notes' },
];

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const isSettingsActive = pathname === '/configuracoes' || pathname.startsWith('/configuracoes/');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* ========== SIDEBAR (DESKTOP) ========== */}
      <aside className="fixed inset-y-0 left-0 hidden lg:flex w-64 border-r border-slate-200 bg-slate-100 flex-col justify-between py-12 z-50">
        <div className="px-8 py-4 text-center border-b border-slate-200">
          <h1 className="text-2xl font-bold text-blue-600">Autônomo +</h1>
          <p className="text-sm text-slate-500 mt-1">Gestão de Serviços</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1 px-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-md px-6 py-3 text-sm font-semibold flex items-center gap-3 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 before:absolute before:left-0 before:w-1 before:h-8 before:bg-blue-600 before:rounded-r'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/configuracoes"
          className={`relative rounded-md px-6 py-3 text-sm font-semibold flex items-center gap-3 transition-all duration-200 ${
            isSettingsActive
              ? 'text-blue-600 bg-blue-50 before:absolute before:left-0 before:w-1 before:h-8 before:bg-blue-600 before:rounded-r'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          <span className="material-symbols-outlined text-lg">settings</span>
          Configurações
        </Link>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="lg:pl-64 pb-32 lg:pb-0">
        {/* ✅ pb-32 = padding-bottom grande para mobile (bottom nav) */}
        
        {/* Header */}
        <header className="sticky top-0 z-40 flex justify-between items-center border-b border-slate-200 bg-white/80 backdrop-blur px-4 py-4 lg:px-8">
          <span className="text-sm font-bold text-slate-500">Autônomo +</span>

          <div className="flex items-center justify-center gap-4">
            <button className="cursor-pointer hover:text-blue-600 transition-colors" aria-label="Calendário">
              <span className="material-symbols-outlined">calendar_today</span>
            </button>

            <button className="cursor-pointer hover:text-blue-600 transition-colors" aria-label="Notificações">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button
              className="cursor-pointer bg-blue-600 text-white flex items-center justify-center rounded-full w-10 h-10 hover:bg-blue-700 transition-colors"
              aria-label="Perfil"
            >
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-120px)]">
          {/* ✅ min-h-[calc(100vh-120px)] garante espaço mínimo */}
          {children}
        </main>
      </div>

      {/* ========== BOTTOM NAV (MOBILE) ========== */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden flex flex-col border-t border-slate-200 bg-slate-100 z-50 w-full">
        <ul className="flex flex-row justify-around items-stretch gap-0 px-1 py-2 list-none w-full">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href} className="flex-1 min-w-0">
                {/* ✅ min-w-0 garante que não overflow */}
                <Link
                  href={item.href}
                  className={`relative flex flex-col justify-center items-center gap-0.5 py-2 px-1 text-center text-[10px] font-semibold transition-all duration-200 h-full ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {/* Barra indicadora */}
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-blue-600 rounded-full animate-fadeNavBottom" />
                  )}
                  
                  <span className="material-symbols-outlined text-base leading-none">
                    {item.icon}
                  </span>
                  
                  <span className="truncate w-full">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
