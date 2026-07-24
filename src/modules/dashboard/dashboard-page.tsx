'use client'

import Grafico from "@/components/ui/grafico";
import {
  KPICard,
  SectionHeader,
  ChartHeader,
  ClientsRankSection,
  RoutesSection,
} from "@/components/ui/dashboard"

import { ReactNode, useState, useEffect } from "react";
import { obterDashboardResumo } from "@/services/dashboardService";
import type { DashboardResumo, DashboardKPICard } from "@/types/dashboard";
import { SkeletonCard, Skeleton } from "@/components/ui/skeleton";

export function DashboardPage(): ReactNode {
  const [periodSelected, setPeriodSelected] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const dados = await obterDashboardResumo();
        setResumo(dados);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const kpiCards: DashboardKPICard[] = [
    {
      icon: "payments",
      label: "RECEITA MENSAL",
      value: resumo ? `R$ ${resumo.receitaMensal}` : "R$ 0,00",
      trend: { icon: "trending_up", percentage: 5 },
    },
    {
      icon: "account_balance_wallet",
      label: "LUCRO MENSAL",
      value: resumo ? `R$ ${resumo.lucroMensal}` : "R$ 0,00",
      trend: { icon: "trending_flat", percentage: 0 },
    },
    {
      icon: "pending_actions",
      label: "TOTAL PARA RECEBER",
      value: resumo ? `R$ ${resumo.totalParaReceber}` : "R$ 0,00",
    },
    {
      icon: "event",
      label: "TOTAL DE ATENDIMENTOS",
      value: resumo ? resumo.totalAtendimentos : "0",
    },
  ];

  const handlePeriodChange = (period: "monthly" | "yearly") => {
    setPeriodSelected(period);
  };

  return (
    <>
      {/* ====== CABEÇALHO E ALERTA ====== */}
      <SectionHeader
        title="Visão Geral"
        description="Situação das operações de serviço do mês atual."
        alert={
          resumo && resumo.clientesPendentes > 0
            ? {
                icon: "error",
                message: `${resumo.clientesPendentes} cliente(s) com pagamento pendente`,
              }
            : undefined
        }
      />

      {/* ====== CARDS DE RESUMO FINANCEIRO (KPIs) ====== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {carregando
          ? Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : kpiCards.map((card, index) => (
              <KPICard key={index} {...card} />
            ))}
      </div>

      {/* ====== SEÇÃO DE ESTATÍSTICAS (Gráfico + Ranking) ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 p-8 bg-white rounded-xl shadow-sm min-h-105 flex flex-col">
          <ChartHeader
            title="Desempenho da receita"
            subtitle="Resumo mensal dos atendimentos"
            activePeriod={periodSelected}
            onPeriodChange={handlePeriodChange}
          />

          <div className="flex-1 min-h-0">
            {carregando ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <Grafico height={300} />
            )}
          </div>
        </div>

        {/* TOP CLIENTES */}
        {carregando ? (
          <div className="p-7 rounded-2xl bg-white shadow-md flex flex-col gap-4">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </div>
        ) : (
          <ClientsRankSection clients={resumo?.topClientes ?? []} />
        )}
      </div>

      {/* ====== ROTAS DO DIA ====== */}
      {carregando ? (
        <div className="p-8 rounded-xl bg-gray-100 space-y-4">
          <Skeleton className="w-40 h-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      ) : (
        <RoutesSection routes={resumo?.rotasDoDia ?? []} />
      )}
    </>
  );
}
