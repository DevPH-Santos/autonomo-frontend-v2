/**
 * PÁGINA DE PAGAMENTOS
 * 
 * Este arquivo contém o componente principal para gerenciar e visualizar pagamentos.
 * Inclui:
 * - Dashboard com métricas de pagamentos
 * - Filtros para buscar pagamentos específicos
 * - Tabela listando todos os pagamentos
 * - Modal para editar/criar novos pagamentos
 * - Paginação para navegar entre páginas
 * 
 * @component
 * @example
 * return <PagamentosPage />
 */

'use client'

import { useState } from 'react'
import { EditarPagamentoModal } from '@/components/ui/EditarPagamentoModal'

// ==========================================
// TIPOS E INTERFACES
// ==========================================

/**
 * Interface que define a estrutura de um pagamento
 * 
 * @interface Pagamento
 * @property {string} id - Identificador único do pagamento
 * @property {string} iniciais - Iniciais do nome do cliente (ex: "AM" para Andréa Martins)
 * @property {string} cliente - Nome completo do cliente
 * @property {string} endereco - Endereço de entrega/localização do cliente
 * @property {string} mesRef - Mês de referência do pagamento (ex: "Março 2024")
 * @property {string} valor - Valor do pagamento em formato brasileiro (ex: "R$ 450,00")
 * @property {string} vencimento - Data de vencimento no formato DD/MM/YYYY
 * @property {'pago' | 'pendente' | 'atrasado'} status - Status atual do pagamento
 */
interface Pagamento {
  id: string
  iniciais: string
  cliente: string
  endereco: string
  mesRef: string
  valor: string
  vencimento: string
  status: 'pago' | 'pendente' | 'atrasado'
}

// ==========================================
// DADOS MOCKADOS
// ==========================================

/**
 * Array com dados mockados de pagamentos para exibição inicial
 * 
 * Em um projeto real, esses dados viriam de uma API/banco de dados.
 * Para fins de demonstração, usamos dados estáticos aqui.
 * 
 * @type {Pagamento[]}
 */
const PAGAMENTOS: Pagamento[] = [
  {
    id: '1',
    iniciais: 'AM',
    cliente: 'Andréa Martins',
    endereco: 'Residencial Lagoa',
    mesRef: 'Março 2024',
    valor: 'R$ 450,00',
    vencimento: '15/03/2024',
    status: 'pago',
  },
  {
    id: '2',
    iniciais: 'RG',
    cliente: 'Ricardo Gomes',
    endereco: 'Condomínio Alpha',
    mesRef: 'Março 2024',
    valor: 'R$ 380,00',
    vencimento: '22/03/2024',
    status: 'pendente',
  },
  {
    id: '3',
    iniciais: 'ML',
    cliente: 'Mariana Luz',
    endereco: 'Casa Particular',
    mesRef: 'Março 2024',
    valor: 'R$ 520,00',
    vencimento: '05/03/2024',
    status: 'atrasado',
  },
  {
    id: '4',
    iniciais: 'JC',
    cliente: 'Julio Cesar',
    endereco: 'Residencial Ipês',
    mesRef: 'Março 2024',
    valor: 'R$ 420,00',
    vencimento: '10/03/2024',
    status: 'pago',
  },
]

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

/**
 * Componente que exibe um badge (etiqueta) visual com o status do pagamento
 * 
 * O badge muda de cor e conteúdo dependendo do status:
 * - PAGO: verde com ícone
 * - PENDENTE: cinza com ícone
 * - ATRASADO: vermelho com ícone
 * 
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {'pago' | 'pendente' | 'atrasado'} props.status - Status do pagamento a ser exibido
 * @returns {JSX.Element} Badge estilizado com status
 */
function StatusBadge({ status }: { status: 'pago' | 'pendente' | 'atrasado' }) {
  // Configuração visual para cada status: cores de fundo, texto e ícone
  const statusConfig = {
    pago: {
      bg: 'bg-emerald-100',        // fundo verde claro
      text: 'text-emerald-700',     // texto verde escuro
      label: 'PAGO',
      dot: 'bg-emerald-600',        // círculo verde
    },
    pendente: {
      bg: 'bg-slate-200',           // fundo cinza claro
      text: 'text-slate-700',       // texto cinza escuro
      label: 'PENDENTE',
      dot: 'bg-slate-500',          // círculo cinza
    },
    atrasado: {
      bg: 'bg-red-100',             // fundo vermelho claro
      text: 'text-red-700',         // texto vermelho escuro
      label: 'ATRASADO',
      dot: 'bg-red-600',            // círculo vermelho
    },
  }

  // Obtém a configuração correspondente ao status
  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${config.bg} ${config.text}`}>
      {/* Círculo colorido como indicador visual */}
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

/**
 * Componente que exibe um avatar circular com as iniciais do cliente
 * 
 * Usado na coluna de cliente na tabela para facilitar identificação visual
 * 
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {string} props.iniciais - Iniciais do cliente (ex: "AM")
 * @returns {JSX.Element} Avatar circular com iniciais
 */
function ClientAvatar({ iniciais }: { iniciais: string }) {
  return (
    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
      {iniciais}
    </div>
  )
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

/**
 * Componente principal da página de pagamentos
 * 
 * Renderiza a interface completa de gerenciamento de pagamentos, incluindo:
 * 1. Dashboard com métricas (total recebido, a receber, em atraso)
 * 2. Barra de filtros para buscar pagamentos
 * 3. Tabela com lista de pagamentos
 * 4. Paginação para navegar entre páginas
 * 5. Modal para editar/criar pagamentos
 * 
 * @component
 * @returns {JSX.Element} Página completa de pagamentos
 */
export function PagamentosPage() {
  // ===== ESTADO DA PÁGINA =====
  
  /** Controla qual página está sendo exibida (default: página 1) */
  const [paginaAtual, setPaginaAtual] = useState(1)
  
  /** Controla se o modal de edição está aberto ou fechado */
  const [modalAberto, setModalAberto] = useState(false)
  
  /** Armazena o pagamento selecionado para edição (null = criar novo) */
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null)

  // ===== HANDLERS (Funções de ação) =====

  /**
   * Abre o modal de edição com um pagamento selecionado
   * 
   * Quando o usuário clica em editar em um pagamento existente,
   * esta função armazena o pagamento e abre o modal
   * 
   * @param {Pagamento} pagamento - Pagamento a ser editado
   */
  const handleEditarPagamento = (pagamento: Pagamento) => {
    setPagamentoSelecionado(pagamento)
    setModalAberto(true)
  }

  return (
    <div className="space-y-8">
      {/* ===== SEÇÃO 1: MÉTRICAS DO DASHBOARD ===== */}
      {/* 
        Exibe 3 cards principais com informações resumidas:
        - Total recebido no período (com comparativo +12%)
        - Total a receber este mês
        - Total em atraso (requer atenção)
      */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Recebido */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-emerald-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            {/* Ícone do card (carteira) */}
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            {/* Badge de crescimento (+12%) */}
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              +12%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Total recebido</p>
            <h3 className="text-2xl font-black text-slate-900">R$ 12.800,00</h3>
          </div>
        </div>

        {/* Card 2: Total a Receber */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-blue-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            {/* Ícone do card (ações pendentes) */}
            <div className="w-12 h-12 bg-sky-100 text-blue-600 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            {/* Badge de período */}
            <span className="text-xs font-bold text-blue-600 bg-sky-100/60 px-2 py-1 rounded-lg">
              Este Mês
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Total a receber no mês</p>
            <h3 className="text-2xl font-black text-slate-900">R$ 4.250,00</h3>
          </div>
        </div>

        {/* Card 3: Total em Atraso */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:bg-red-50/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            {/* Ícone do card (aviso) */}
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">warning</span>
            </div>
            {/* Badge de atenção */}
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
              Atenção
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-1">Total em atraso</p>
            <h3 className="text-2xl font-black text-red-600">R$ 850,00</h3>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO 2: BARRA DE FILTROS ===== */}
      {/* 
        Permite filtrar os pagamentos por:
        - Status (pago, pendente, atrasado)
        - Cliente
        - Mês/período
        
        Também contém botão para criar novo lançamento
      */}
      <section className="bg-slate-100 p-5 rounded-2xl flex flex-wrap items-center gap-4">
        {/* Rótulo de filtros */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-600 text-lg">filter_list</span>
          <span className="text-sm font-semibold text-slate-600 mr-2">Filtros:</span>
        </div>

        {/* Controles de filtro (dropdowns) */}
        <div className="flex flex-wrap gap-3 flex-1">
          
          {/* Filtro por Status */}
          <select className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900">
            <option value="">Status: Todos</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="atrasado">Atrasado</option>
          </select>

          {/* Filtro por Cliente */}
          <select className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900">
            <option value="">Cliente: Todos</option>
            <option value="1">Andréa Martins</option>
            <option value="2">Ricardo Gomes</option>
            <option value="3">Mariana Luz</option>
          </select>

          {/* Filtro por Mês */}
          <select className="bg-white border-none rounded-lg text-xs font-semibold px-4 py-2 focus:ring-2 focus:ring-blue-500/30 text-slate-900">
            <option value="">Mês: Março/2024</option>
            <option value="02-24">Fevereiro/2024</option>
            <option value="01-24">Janeiro/2024</option>
          </select>
        </div>

        {/* Botão para criar novo lançamento */}
        <button
          onClick={() => {
            // Limpa seleção anterior e abre modal em modo "criar novo"
            setPagamentoSelecionado(null)
            setModalAberto(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-xs font-bold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Lançamento
        </button>
      </section>

      {/* ===== SEÇÃO 3: TABELA DE PAGAMENTOS ===== */}
      {/* 
        Exibe uma tabela com todos os pagamentos do período
        Cada linha contém informações do cliente, valores, status e ações
        A tabela é responsiva com scroll horizontal em telas pequenas
      */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            
            {/* CABEÇALHO DA TABELA */}
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Cliente
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Mês Ref.
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Valor
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Vencimento
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>

            {/* CORPO DA TABELA */}
            <tbody className="divide-y divide-slate-200">
              {/* Itera sobre todos os pagamentos e cria uma linha para cada um */}
              {PAGAMENTOS.map((pag) => (
                <tr key={pag.id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* Coluna: Cliente com avatar e endereço */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ClientAvatar iniciais={pag.iniciais} />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{pag.cliente}</p>
                        <p className="text-xs text-slate-500">{pag.endereco}</p>
                      </div>
                    </div>
                  </td>

                  {/* Coluna: Mês de referência */}
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{pag.mesRef}</td>

                  {/* Coluna: Valor do pagamento */}
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{pag.valor}</td>

                  {/* Coluna: Data de vencimento */}
                  <td className="px-6 py-4 text-sm text-slate-600">{pag.vencimento}</td>

                  {/* Coluna: Status com badge visual */}
                  <td className="px-6 py-4">
                    <StatusBadge status={pag.status} />
                  </td>

                  {/* Coluna: Ações disponíveis para o pagamento */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      
                      {/* Botão "Marcar Pago" - só aparece se status é pendente */}
                      {pag.status === 'pendente' && (
                        <button className="text-blue-600 hover:underline text-xs font-bold px-3 py-1 rounded-lg bg-blue-50">
                          Marcar Pago
                        </button>
                      )}

                      {/* Botão "Cobrar Cliente" - só aparece se status é atrasado */}
                      {pag.status === 'atrasado' && (
                        <button className="text-red-600 hover:underline text-xs font-bold px-3 py-1 rounded-lg border border-red-200">
                          Cobrar Cliente
                        </button>
                      )}

                      {/* Botão: Editar pagamento */}
                      <button
                        onClick={() => handleEditarPagamento(pag)}
                        className="text-slate-500 hover:text-blue-600 transition-colors"
                        title="Editar pagamento"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>

                      {/* Botão: Deletar pagamento */}
                      <button
                        className="text-slate-500 hover:text-red-600 transition-colors"
                        title="Deletar pagamento"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== SEÇÃO 4: PAGINAÇÃO ===== */}
        {/* 
          Permite navegar entre páginas da tabela
          Mostra o total de itens e permite ir para frente/trás ou página específica
        */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 bg-white">
          
          {/* Texto informativo sobre a paginação */}
          <p className="text-xs text-slate-600 font-medium">Exibindo 4 de 128 pagamentos</p>

          {/* Controles de navegação */}
          <div className="flex items-center gap-2">
            
            {/* Botão: Página anterior */}
            <button
              onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
              disabled={paginaAtual === 1} // Desabilita se já estamos na primeira página
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            {/* Botões: Números de página (1, 2, 3) */}
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setPaginaAtual(num)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  paginaAtual === num
                    ? 'bg-blue-600 text-white'  // Página ativa
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-100'  // Página inativa
                }`}
              >
                {num}
              </button>
            ))}

            {/* Botão: Próxima página */}
            <button
              onClick={() => setPaginaAtual(paginaAtual + 1)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== MODAL DE EDIÇÃO ===== */}
      {/* 
        Modal que aparece quando:
        1. Usuário clica em "Novo Lançamento" (pagamentoSelecionado = null)
        2. Usuário clica em editar um pagamento existente (pagamentoSelecionado = pagamento)
        
        Usa key dinâmica para forçar remontagem do componente quando muda de modo
      */}
      <EditarPagamentoModal
        key={pagamentoSelecionado?.id ?? 'novo-pagamento'}
        isOpen={modalAberto}
        pagamento={pagamentoSelecionado}
        onClose={() => {
          setModalAberto(false)
          setPagamentoSelecionado(null)
        }}
      />
    </div>
  )
}
