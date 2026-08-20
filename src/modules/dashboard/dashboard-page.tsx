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
import type { DashboardResumo } from "@/types/dashboard";
import { SkeletonCard, Skeleton } from "@/components/ui/skeleton";

export function DashboardPage(): ReactNode {
  const [periodSelected, setPeriodSelected] = useState<"dia" | "mes" | "ano">("mes");
  const [monthSelected, setMonthSelected] = useState(new Date().getMonth());
  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const dados = await obterDashboardResumo(
          periodSelected,
          periodSelected === "dia" ? monthSelected : undefined,
          periodSelected === "dia" || periodSelected === "mes" ? yearSelected : undefined
        );
        setResumo(dados);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [periodSelected, monthSelected, yearSelected]);

  const getGraficoData = () => {
    switch (periodSelected) {
      case "dia":
        return resumo?.dadosDia;
      case "mes":
        return resumo?.dadosMes;
      case "ano":
        return resumo?.dadosAno;
      default:
        return [];
    }
  };

  const kpiCards = [
    {
      icon: "payments" as const,
      label: "RECEITA MENSAL",
      value: resumo ? `R$ ${resumo.receitaMensal}` : "R$ 0,00",
      trend: { icon: "trending_up" as const, percentage: 5 },
    },
    {
      icon: "account_balance_wallet" as const,
      label: "LUCRO MENSAL",
      value: resumo ? `R$ ${resumo.lucroMensal}` : "R$ 0,00",
      trend: { icon: "trending_flat" as const, percentage: 0 },
    },
    {
      icon: "pending_actions" as const,
      label: "TOTAL PARA RECEBER",
      value: resumo ? `R$ ${resumo.totalParaReceber}` : "R$ 0,00",
    },
    {
      icon: "event" as const,
      label: "TOTAL DE ATENDIMENTOS",
      value: resumo ? resumo.totalAtendimentos : "0",
    },
  ];

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
            subtitle={
              periodSelected === "dia"
                ? "Resumo diário do mês"
                : periodSelected === "mes"
                  ? "Resumo mensal do ano"
                  : "Resumo anual desde o início"
            }
            activePeriod={periodSelected}
            onPeriodChange={(period) => setPeriodSelected(period as "dia" | "mes" | "ano")}
            monthSelected={monthSelected}
            onMonthChange={setMonthSelected}
            yearSelected={yearSelected}
            onYearChange={setYearSelected}
            showMonthFilter={periodSelected === "dia"}
            showYearFilter={periodSelected === "dia" || periodSelected === "mes"}
          />

          <div className="flex-1 min-h-0">
            {carregando ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <Grafico data={getGraficoData()} height={300} />
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
