'use client'

import Grafico from "@/components/ui/grafico";

import {
  KPICard,
  SectionHeader,
  ChartHeader,
  ClientsRankSection,
  RoutesSection,
} from "@/components/ui/dashboard"

import { ReactNode, useState } from "react";

interface Route {
  hour: string;
  period: "AM" | "PM";
  objective: string;
  address: string;
}

interface Client {
  position: number;
  name: string;
  service: string;
  revenue: string;
}

interface KPICard {
  icon: string;
  label: string;
  value: string;
  trend?: {
    icon: string;
    percentage: number;
  };
}

export function DashboardPage(): ReactNode {
  const [periodSelected, setPeriodSelected] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const kpiCards: KPICard[] = [
    {
      icon: "payments",
      label: "RECEITA MENSAL",
      value: "4.500,00",
      trend: { icon: "trending_up", percentage: 5 },
    },
    {
      icon: "account_balance_wallet",
      label: "LUCRO MENSAL",
      value: "2.800,00",
      trend: { icon: "trending_flat", percentage: 0 },
    },
    {
      icon: "pending_actions",
      label: "TOTAL PARA RECEBER",
      value: "1.200,00",
    },
    {
      icon: "event",
      label: "TOTAL DE ATENDIMENTOS",
      value: "42",
    },
  ];

  const topClients: Client[] = [
    {
      position: 1,
      name: "João Silva",
      service: "Serviço residencial",
      revenue: "800,00",
    },
    {
      position: 2,
      name: "João Silva",
      service: "Serviço residencial",
      revenue: "800,00",
    },
    {
      position: 3,
      name: "João Silva",
      service: "Serviço residencial",
      revenue: "800,00",
    },
  ];

  const dailyRoutes: Route[] = [
    {
      hour: "09:00",
      period: "AM",
      objective: "Peneiração",
      address: "Rua Santiago, 23B",
    },
    {
      hour: "11:30",
      period: "AM",
      objective: "Limpeza de Borda",
      address: "Rua Bento Alves de Godoy, 223A",
    },
    {
      hour: "14:15",
      period: "PM",
      objective: "Limpeza Completa",
      address: "Av. Novaes, 39B",
    },
  ];

  const handlePeriodChange = (period: "monthly" | "yearly") => {
    setPeriodSelected(period);
    console.log(`Período alterado para: ${period}`);
    // Aqui você pode fazer fetch de novos dados baseado no período
  };

  return (
    <>
      {/* ====== CABEÇALHO E ALERTA ====== */}
      <SectionHeader
        title="Visão Geral"
        description="Situação das operações de serviço de piscina do mês atual."
        alert={{
          icon: "error",
          message: "2 clientes com pagamento pendente",
        }}
      />

      {/* ====== CARDS DE RESUMO FINANCEIRO (KPIs) ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {kpiCards.map((card, index) => (
          <KPICard key={index} {...card} />
        ))}
      </div>

      {/* ====== SEÇÃO DE ESTATÍSTICAS (Gráfico + Ranking) ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 p-8 bg-white rounded-xl shadow-sm min-h-105 flex flex-col">
          {/* ✅ Passar activePeriod e onPeriodChange */}
          <ChartHeader
            title="Desempenho da receita"
            subtitle="Resumo semanal para abril"
            activePeriod={periodSelected}
            onPeriodChange={handlePeriodChange}
          />

          <div className="flex-1 min-h-0">
            <Grafico height={300} />
          </div>
        </div>

        {/* TOP CLIENTES */}
        <ClientsRankSection
          clients={topClients}
        />
      </div>

      {/* ====== ROTAS DO DIA ====== */}
      <RoutesSection routes={dailyRoutes} />
    </>
  );
}
