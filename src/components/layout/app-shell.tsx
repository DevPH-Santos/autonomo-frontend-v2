"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/clientes", label: "Clientes", icon: "contacts_product" },
  { href: "/atendimentos", label: "Atendimentos", icon: "event_available" },
  { href: "/despesas", label: "Despesas", icon: "receipt_long" },
  { href: "/pagamentos", label: "Pagamentos", icon: "payments" },
  { href: "/produtos", label: "Produtos", icon: "inventory_2" },
  { href: "/lembretes", label: "Lembretes", icon: "add_notes" }
];

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {

  const pathname = usePathname();

  const isSettingsActive = pathname === "/configuracoes" || pathname.startsWith("/configuracoes/");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">

      <aside className="fixed inset-y-0 left-0 w-64 border-r flex flex-col justify-between text-(--color_text_muted) border-slate-200 bg-[#f0f4f7] py-12">

        <nav className="flex flex-col gap-1">

          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={` relative rounded-md px-8 py-3 text-sm font-bold justify-items-start items-center gap-2 flex transition 
                  ${isActive ? "before:animate-[fadeNav_0.3s_ease-in-out] font-bold text-(--color_primary_dark) bg-(--color_background_light) before:absolute before:left-0 before:h-8 before:w-1.25 before:rounded-xl before:bg-(--color_accent) before:content-['']" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  } 
                `}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/configuracoes"
          className={` relative rounded-md px-8 py-3 text-sm font-bold justify-items-start items-center gap-2 flex transition 
            ${isSettingsActive ? "before:animate-[fadeNav_0.3s_ease-in-out] font-bold text-(--color_primary_dark) bg-(--color_background_light) before:absolute before:left-0 before:h-8 before:w-1.25 before:rounded-xl before:bg-(--color_accent) before:content-['']"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"} `}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            settings
          </span>
          Configurações
        </Link>

      </aside>

      <div className="lg:pl-64">

        <header className="sticky top-0 z-10 flex justify-between items-center text-(--color_primary_variant) border-b border-slate-200 bg-(--color_bg_soft_alpha) px-4 py-4 backdrop-blur lg:px-8">
          <span className="text-sm font-bold text-slate-500">Autonomo +</span>

          <div className="flex items-center justify-center gap-4 text-center">

            <button className="cursor-pointer" aria-label="Calendário">
              <span className="material-symbols-outlined">calendar_today</span>
            </button>

            <div>

              <button className="cursor-pointer" aria-label="Notificações">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              
              <button className="cursor-pointer" aria-label="Notificações não lidas">
                <span className="material-symbols-outlined">notifications_unread</span>
              </button>

            </div>

            <button className="cursor-pointer bg-(--color_accent) text-white flex items-center justify-center rounded-full w-10 h-10" aria-label="Informações pessoais">
              <span className="material-symbols-outlined">person</span>
            </button>

          </div>

        </header>

        <main className="px-4 py-6 lg:px-8 max-w-7xl m-auto">{children}</main>

      </div>

    </div>
  );
}
