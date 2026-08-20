import type { IconName } from "@/components/ui/icon";

export interface DashboardKPICard {
    icon: IconName;
    label: string;
    value: string;
    trend?: {
        icon: IconName;
        percentage: number;
    };
}

export interface ClientRank {
    position: number;
    name: string;
    service: string;
    revenue: string;
}

export interface RouteItem {
    hour: string;
    period: "AM" | "PM";
    objective: string;
    address: string;
}

export interface GraficoData {
    name: string;
    receita: number;
}

export interface DashboardResumo {
    receitaMensal: string;
    lucroMensal: string;
    totalParaReceber: string;
    totalAtendimentos: string;
    clientesPendentes: number;
    topClientes: ClientRank[];
    rotasDoDia: RouteItem[];
    dadosDia: GraficoData[];
    dadosMes: GraficoData[];
    dadosAno: GraficoData[];
}
