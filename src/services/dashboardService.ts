import { apiFetch } from "./api";
import { formatarMoeda } from "./configuracoesService";
import type { DashboardResumo } from "@/types/dashboard";

export async function obterDashboardResumo(
    period: "dia" | "mes" | "ano" = "mes",
    month?: number,
    year?: number
): Promise<DashboardResumo> {
    const params = new URLSearchParams();
    if (period !== "ano" && year !== undefined) {
        if (period === "mes") {
            params.set("inicio", `${year}-01-01`);
            params.set("fim", `${year}-12-31`);
        } else {
            const mesSelecionado = month ?? new Date().getMonth();
            const ultimoDia = new Date(year, mesSelecionado + 1, 0).getDate();
            const prefixo = `${year}-${String(mesSelecionado + 1).padStart(2, "0")}`;
            params.set("inicio", `${prefixo}-01`);
            params.set("fim", `${prefixo}-${String(ultimoDia).padStart(2, "0")}`);
        }
    }

    type DashboardApiResponse = {
        indicadores?: {
            atendimentos?: number;
            faturamento?: number;
            aReceber?: number;
            saldo?: number;
        };
        graficos?: {
            receitaPorDia?: Array<Record<string, unknown>>;
            receitaPorMes?: Array<Record<string, unknown>>;
            receitaPorAno?: Array<Record<string, unknown>>;
            pagamentosPorStatus?: Array<Record<string, unknown>>;
        };
        topClientes?: Array<Record<string, unknown>>;
        rotasHoje?: Array<Record<string, unknown>>;
    };

    const query = params.size > 0 ? `?${params.toString()}` : "";
    const response = await apiFetch<DashboardApiResponse>(`/dashboard${query}`);
    const indicadores = response.indicadores ?? {};
    const normalizarSerie = (serie: Array<Record<string, unknown>> = []) => serie.map((item) => ({
        name: String(item.nome ?? item.name ?? item.label ?? item.mes ?? item.periodo ?? ""),
        receita: Number(item.receita ?? item.faturamento ?? item.valor ?? item.total ?? 0),
    })).filter((item) => item.name.length > 0 && Number.isFinite(item.receita));
    const clientesPendentes = (response.graficos?.pagamentosPorStatus ?? []).reduce((total, item) => {
        const status = String(item.status ?? item.nome ?? item.name ?? item.label ?? "").toLowerCase();
        if (!status.includes("pend") && !status.includes("atras")) return total;
        return total + Number(item.quantidade ?? item.total ?? item.count ?? 0);
    }, 0);

    return {
        receitaMensal: formatarMoeda(indicadores.faturamento ?? 0),
        lucroMensal: formatarMoeda(indicadores.saldo ?? 0),
        totalParaReceber: formatarMoeda(indicadores.aReceber ?? 0),
        totalAtendimentos: String(indicadores.atendimentos ?? 0),
        clientesPendentes: Number.isFinite(clientesPendentes) ? clientesPendentes : 0,
        topClientes: (response.topClientes ?? []).map((item, index) => ({
            position: Number(item.posicao ?? item.position ?? index + 1),
            name: String(item.nome ?? item.nomeCliente ?? item.cliente ?? "Cliente sem nome"),
            service: String(item.tipoServico ?? item.servico ?? item.tipo ?? "Serviço"),
            revenue: formatarMoeda(Number(item.faturamento ?? item.receita ?? item.valor ?? 0)),
        })),
        rotasDoDia: (response.rotasHoje ?? []).map((item) => {
            const horario = String(item.horario ?? item.hora ?? item.dataHora ?? "");
            const hora = horario.match(/\d{1,2}:\d{2}/)?.[0] ?? "--:--";
            const horaNumerica = Number(hora.split(":")[0]);
            return {
                hour: hora,
                period: horaNumerica >= 12 ? "PM" as const : "AM" as const,
                objective: String(item.descricao ?? item.servico ?? item.titulo ?? "Atendimento"),
                address: String(item.endereco ?? item.enderecoCliente ?? item.local ?? "Endereço não cadastrado"),
            };
        }),
        dadosDia: normalizarSerie(response.graficos?.receitaPorDia),
        dadosMes: normalizarSerie(response.graficos?.receitaPorMes),
        dadosAno: normalizarSerie(response.graficos?.receitaPorAno),
    };
}
