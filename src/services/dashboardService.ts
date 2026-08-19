import { apiFetch } from "./api";
import { listarAtendimentos } from "./atendimentoService";
import { listarClientes } from "./clienteService";
import { formatarValor } from "./formatters";
import type { DashboardResumo } from "@/types/dashboard";

export async function obterDashboardResumo(): Promise<DashboardResumo> {
    try {
        const dashboardData = await apiFetch<DashboardResumo>("/dashboard").catch(() => null);
        if (dashboardData && dashboardData.receitaMensal) {
            return dashboardData;
        }

        // Fallback dinâmico calculando com base nas chamadas de atendimentos e clientes
        const [resAtendimentos, resClientes] = await Promise.all([
            listarAtendimentos().catch(() => ({ total: 0, atendimentos: [] })),
            listarClientes().catch(() => ({ total: 0, clientes: [] })),
        ]);

        const atendimentos = resAtendimentos.atendimentos ?? [];
        const clientes = resClientes.clientes ?? [];

        let totalReceita = 0;
        let totalPendente = 0;
        let clientesComPendenciaCount = 0;

        atendimentos.forEach((atend) => {
            const valor = typeof atend.total_atendimento === "number"
                ? atend.total_atendimento
                : parseFloat(String(atend.total_atendimento || 0));

            if (atend.status_atendimento === "Realizado") {
                totalReceita += valor;
            } else if (atend.status_atendimento === "Pendente") {
                totalPendente += valor;
                clientesComPendenciaCount++;
            }
        });

        // 30% como margem de custo presumida para lucro mensal
        const lucroCalculado = totalReceita * 0.7;

        const topClientes = clientes
            .sort((a, b) => {
                const valorA = typeof a.valor_visita_cliente === "number"
                    ? a.valor_visita_cliente
                    : parseFloat(String(a.valor_visita_cliente || 0));

                const valorB = typeof b.valor_visita_cliente === "number"
                    ? b.valor_visita_cliente
                    : parseFloat(String(b.valor_visita_cliente || 0));

                return valorB - valorA; // Decrescente (maior primeiro)
            })
            .slice(0, 3)
            .map((cliente, index) => ({
                position: index + 1,
                name: cliente.nome_cliente,
                service: cliente.tipo_contratacao_cliente || "Serviço residencial",
                revenue: cliente.valor_visita_cliente ? formatarValor(cliente.valor_visita_cliente) : "0,00",
            }))

        const rotasDoDia = atendimentos.slice(0, 3).map((atend) => {
            const dataObj = new Date(atend.data_atendimento || Date.now());
            const horaStr = dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            const horasNum = dataObj.getHours();

            return {
                hour: horaStr !== "Invalid Date" ? horaStr : "09:00",
                period: horasNum >= 12 ? ("PM" as const) : ("AM" as const),
                objective: atend.descri_atendimento || "Manutenção de Rotina",
                address: atend.nome_cliente ? `Cliente: ${atend.nome_cliente}` : "Endereço não cadastrado",
            };
        });

        return {
            receitaMensal: formatarValor(totalReceita),
            lucroMensal: formatarValor(lucroCalculado),
            totalParaReceber: formatarValor(totalPendente),
            totalAtendimentos: String(atendimentos.length),
            clientesPendentes: clientesComPendenciaCount,
            topClientes: topClientes.length > 0 ? topClientes : [
                { position: 1, name: "Nenhum cliente cadastrado", service: "Cadastre clientes no sistema", revenue: "0,00" }
            ],
            rotasDoDia,
        };
    } catch (error) {
        console.error("Erro ao obter resumo do dashboard:", error);
        return {
            receitaMensal: "0,00",
            lucroMensal: "0,00",
            totalParaReceber: "0,00",
            totalAtendimentos: "0",
            clientesPendentes: 0,
            topClientes: [],
            rotasDoDia: [],
        };
    }
}
