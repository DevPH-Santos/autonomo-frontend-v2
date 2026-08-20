import { apiFetch } from "./api";
import { listarAtendimentos } from "./atendimentoService";
import { listarClientes } from "./clienteService";
import { listarPagamentos } from "./pagamentoService";
import { formatarValor } from "./formatters";
import type { DashboardResumo, GraficoData } from "@/types/dashboard";
import type { Pagamento } from "@/types/pagamento";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function gerarDadosPorDia(
    pagamentos: Pagamento[],
    year: number,
    month: number
): GraficoData[] {
    const diasNoMes = new Date(year, month + 1, 0).getDate();
    const dados: GraficoData[] = Array.from({ length: diasNoMes }, (_, i) => ({
        name: String(i + 1).padStart(2, "0"),
        receita: 0,
    }));

    pagamentos.forEach((pgto) => {
        const data = new Date(pgto.data);
        if (
            pgto.status === "Pago" &&
            data.getFullYear() === year &&
            data.getMonth() === month
        ) {
            const dia = data.getDate() - 1;
            if (dia >= 0 && dia < dados.length) {
                dados[dia].receita += pgto.valor;
            }
        }
    });

    return dados;
}

function gerarDadosPorMes(
    pagamentos: Pagamento[],
    year: number
): GraficoData[] {
    const dados: GraficoData[] = MESES.map((mes) => ({
        name: mes,
        receita: 0,
    }));

    pagamentos.forEach((pgto) => {
        const data = new Date(pgto.data);
        if (pgto.status === "Pago" && data.getFullYear() === year) {
            const mes = data.getMonth();
            dados[mes].receita += pgto.valor;
        }
    });

    return dados;
}

function gerarDadosPorAno(pagamentos: Pagamento[]): GraficoData[] {
    const anosMap: Record<number, number> = {};
    let anoInicio = new Date().getFullYear();
    let anoFim = new Date().getFullYear();

    pagamentos.forEach((pgto) => {
        const data = new Date(pgto.data);
        const ano = data.getFullYear();

        if (pgto.status === "Pago") {
            anosMap[ano] = (anosMap[ano] || 0) + pgto.valor;
            if (ano < anoInicio) {
                anoInicio = ano;
            }
            if (ano > anoFim) {
                anoFim = ano;
            }
        }
    });

    const dados: GraficoData[] = Array.from(
        { length: anoFim - anoInicio + 1 },
        (_, i) => {
            const ano = anoInicio + i;
            return {
                name: String(ano),
                receita: anosMap[ano] || 0,
            };
        }
    );

    return dados;
}

export async function obterDashboardResumo(
    period: "dia" | "mes" | "ano" = "mes",
    month?: number,
    year?: number
): Promise<DashboardResumo> {
    try {
        const dashboardData = await apiFetch<DashboardResumo>("/dashboard").catch(() => null);

        const [resAtendimentos, resClientes, resPagamentos] = await Promise.all([
            listarAtendimentos().catch(() => ({ total: 0, atendimentos: [] })),
            listarClientes().catch(() => ({ total: 0, clientes: [] })),
            listarPagamentos().catch(() => ({ total: 0, pagamentos: [] })),
        ]);

        const atendimentos = resAtendimentos.atendimentos ?? [];
        const clientes = resClientes.clientes ?? [];
        const pagamentos = resPagamentos.pagamentos ?? [];

        const anoAtual = year || new Date().getFullYear();
        const mesAtual = month !== undefined ? month : new Date().getMonth();

        // Calcula valores de receita e pendências
        let totalReceita = 0;
        let totalPendente = 0;

        pagamentos.forEach((pgto) => {
            if (pgto.status === "Pago") {
                totalReceita += pgto.valor;
            }

            if (pgto.status === "Pendente" || pgto.status === "Atrasado") {
                totalPendente += pgto.valor;
            }
        });

        const lucroCalculado = totalReceita * 0.7;

        // Gera dados dos gráficos
        const dadosDia = gerarDadosPorDia(pagamentos, anoAtual, mesAtual);
        const dadosMes = gerarDadosPorMes(pagamentos, anoAtual);
        const dadosAno = gerarDadosPorAno(pagamentos);

        // Top clientes por valor de visita
        const topClientes = clientes
            .sort((a, b) => {
                const valorA = typeof a.valor_visita_cliente === "number"
                    ? a.valor_visita_cliente
                    : parseFloat(String(a.valor_visita_cliente || 0));

                const valorB = typeof b.valor_visita_cliente === "number"
                    ? b.valor_visita_cliente
                    : parseFloat(String(b.valor_visita_cliente || 0));

                return valorB - valorA;
            })
            .slice(0, 3)
            .map((cliente, index) => ({
                position: index + 1,
                name: cliente.nome_cliente,
                service: cliente.tipo_contratacao_cliente || "Serviço residencial",
                revenue: cliente.valor_visita_cliente ? formatarValor(cliente.valor_visita_cliente) : "0,00",
            }));

        // Rotas do dia
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
            clientesPendentes: pagamentos.filter(p => p.status === "Pendente" || p.status === "Atrasado").length,
            topClientes: topClientes.length > 0 ? topClientes : [
                { position: 1, name: "Nenhum cliente cadastrado", service: "Cadastre clientes no sistema", revenue: "0,00" }
            ],
            rotasDoDia,
            dadosDia,
            dadosMes,
            dadosAno,
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
            dadosDia: [],
            dadosMes: [],
            dadosAno: [],
        };
    }
}
