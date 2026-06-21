'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { Icon, type IconName } from '../ui/icon';
import { logout } from "@/services/authService"

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/clientes', label: 'Clientes', icon: 'contacts_product' },
  { href: '/atendimentos', label: 'Atendimentos', icon: 'event_available' },
  { href: '/despesas', label: 'Despesas', icon: 'receipt_long' },
  { href: '/pagamentos', label: 'Pagamentos', icon: 'payments' },
  { href: '/produtos', label: 'Produtos', icon: 'inventory_2' },
  { href: '/lembretes', label: 'Lembretes', icon: 'add_notes' },
] as const satisfies ReadonlyArray<{
  href: string;
  label: string;
  icon: IconName;
}>;

type NavigationItem = (typeof navigation)[number];

interface AppShellProps {
  children: ReactNode;
  onSearch?: (termo: string) => void;
}

export function AppShell({ children, onSearch }: Readonly<AppShellProps>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [buscaModalAberto, setBuscaModalAberto] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  const isSettingsActive = pathname === '/configuracoes' || pathname.startsWith('/configuracoes/');

  // Fechar drawer ao mudar de rota
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Fechar dropdown de perfil ao mudar de rota
  useEffect(() => {
    setMostrarPerfil(false);
  }, [pathname]);

  const handleBusca = (valor: string) => {
    setBusca(valor);
    onSearch?.(valor);
  };

  const handleBuscaModal = (valor: string) => {
    setBusca(valor);
    onSearch?.(valor);
  };

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const NavItem = ({ item }: { item: NavigationItem }) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        href={item.href}
        className={`relative rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-all duration-200 ${isActive
          ? 'text-blue-600 bg-blue-50 before:absolute before:left-0 before:w-1 before:h-6 before:bg-blue-600 before:rounded-r'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
      >
        <Icon name={item.icon} className="shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* ========== SIDEBAR (DESKTOP + MOBILE DRAWER) ========== */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white flex-col justify-between py-6 z-50 transition-transform duration-300 flex ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="px-6 py-4 text-center border-b border-slate-200 mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Autônomo +</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Gestão de Serviços</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1 px-3 overflow-y-auto">
          {navigation.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        <div className="px-3 border-t border-slate-200 pt-3">
          <Link
            href="/configuracoes"
            className={`relative rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-all duration-200 ${isSettingsActive
              ? 'text-blue-600 bg-blue-50 before:absolute before:left-0 before:w-1 before:h-6 before:bg-blue-600 before:rounded-r'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Icon name="settings" className="shrink-0" />
            <span className="truncate">Configurações</span>
          </Link>
        </div>
      </aside>

      {/* ========== OVERLAY (MOBILE) ========== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== MAIN CONTENT ========== */}
      <div className="lg:pl-64 pb-20 lg:pb-0">
        {/* ========== HEADER ========== */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:gap-4">
            {/* Menu Mobile + Logo Mobile */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Icon name={sidebarOpen ? 'close' : 'menu'} />
              </button>
              <h2 className="text-lg font-bold text-blue-600">A+</h2>
            </div>

            {/* Campo de Busca - Desktop e Tablet */}
            <div className="hidden sm:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Icon name="search" className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg' />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busca}
                  onChange={(e) => handleBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Espaçador flex para desktop (empurra ações para a direita) */}
            <div className="hidden sm:flex flex-1" />

            {/* Ações do Header */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search Mobile - Ícone apenas */}
              <button
                onClick={() => setBuscaModalAberto(true)}
                className="sm:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Buscar"
              >
                <Icon name="search" />
              </button>

              {/* Calendar - Oculto em mobile */}
              <button
                className="hidden sm:flex cursor-pointer text-slate-600 hover:text-blue-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Calendário"
              >
                <Icon name="calendar_today" />
              </button>

              {/* Notificações */}
              <button
                className="relative cursor-pointer text-slate-600 hover:text-blue-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Notificações"
              >
                <Icon name="notifications" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Perfil com Menu */}
              <div className="relative">
                <button
                  onClick={() => setMostrarPerfil(!mostrarPerfil)}
                  className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full hover:bg-blue-700 transition-colors shrink-0"
                  aria-label="Perfil"
                >
                  <Icon name="person" />
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
                        <Icon name="account_circle" className="text-lg" />
                        Meu Perfil
                      </Link>
                      <Link
                        href="/configuracoes"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Icon name="settings" className="text-lg" />
                        Configurações
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left w-full">
                        <Icon name="logout" className="text-lg" />
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

      {/* ========== MODAL BUSCA (MOBILE) ========== */}
      {buscaModalAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start pt-16 sm:hidden">
          <div className="w-full mx-4 bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-slate-200">
              <button
                onClick={() => setBuscaModalAberto(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
                aria-label="Fechar"
              >
                <Icon name="arrow_back" className="text-slate-600" />
              </button>
              <div className="flex-1 relative">
                <Icon name="search" className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar..."
                  value={busca}
                  onChange={(e) => handleBuscaModal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Resultados/Sugestões */}
            {busca && (
              <div className="p-4 max-h-96 overflow-y-auto">
                <p className="text-xs text-slate-500 mb-3">Resultados para "{busca}"</p>
                {/* Adicionar seus componentes de resultado aqui */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
