import { listarAtendimentos, type Atendimento } from '@/services/atendimentoService'
import { listarClientes, type Cliente } from '@/services/clienteService'
import { listarPagamentos, type Pagamento } from '@/services/pagamentoService'

const LIMITE_POR_SECAO = 3

export interface ResultadosBuscaGlobal {
  clientes: Cliente[]
  atendimentos: Atendimento[]
  pagamentos: Pagamento[]
}

function normalizarTexto(valor: string | null | undefined) {
  return (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function pontuacaoTexto(valor: string | null | undefined, termo: string) {
  const texto = normalizarTexto(valor)

  if (texto === termo) return 0
  if (texto.startsWith(termo)) return 1
  return 2
}

function distanciaDaData(valor: string) {
  const data = new Date(valor).getTime()

  return Number.isNaN(data) ? Number.MAX_SAFE_INTEGER : Math.abs(data - Date.now())
}

export async function buscarGlobal(termo: string): Promise<ResultadosBuscaGlobal> {
  const termoNormalizado = normalizarTexto(termo)

  if (termoNormalizado.length < 2) {
    return { clientes: [], atendimentos: [], pagamentos: [] }
  }

  const [respostaClientes, respostaAtendimentos, respostaPagamentos] = await Promise.all([
    listarClientes(),
    listarAtendimentos(),
    listarPagamentos(),
  ])

  const clientes = respostaClientes.clientes
    .filter((cliente) => normalizarTexto(cliente.nome_cliente).includes(termoNormalizado))
    .sort((a, b) => pontuacaoTexto(a.nome_cliente, termoNormalizado) - pontuacaoTexto(b.nome_cliente, termoNormalizado))
    .slice(0, LIMITE_POR_SECAO)

  const atendimentos = respostaAtendimentos.atendimentos
    .filter((atendimento) =>
      normalizarTexto(atendimento.nome_cliente).includes(termoNormalizado) ||
      normalizarTexto(atendimento.descri_atendimento).includes(termoNormalizado)
    )
    .sort((a, b) => distanciaDaData(a.data_atendimento) - distanciaDaData(b.data_atendimento))
    .slice(0, LIMITE_POR_SECAO)

  const pagamentos = respostaPagamentos.pagamentos
    .filter((pagamento) =>
      normalizarTexto(pagamento.cliente).includes(termoNormalizado) ||
      normalizarTexto(pagamento.atendimento?.descricao).includes(termoNormalizado) ||
      normalizarTexto(pagamento.observacao).includes(termoNormalizado)
    )
    .sort((a, b) => distanciaDaData(a.data) - distanciaDaData(b.data))
    .slice(0, LIMITE_POR_SECAO)

  return { clientes, atendimentos, pagamentos }
}
