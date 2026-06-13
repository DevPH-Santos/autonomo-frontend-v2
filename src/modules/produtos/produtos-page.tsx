/**
 * PÁGINA DE PRODUTOS
 * 
 * Este arquivo contém o componente principal para gerenciar e visualizar produtos.
 * Inclui:
 * - Lista de produtos utilizados nos serviços
 * - Tabela com informações de preço, unidade e observações
 * - Modal para criar/editar produtos
 * - Dashboard com estatísticas de produtos
 * 
 * @component
 * @example
 * return <ProdutosPage />
 */

'use client'

import { useState } from 'react'
import { NovoProdutoModal } from "@/components/ui/NovoProdutoModal"

// ==========================================
// TIPOS E INTERFACES
// ==========================================

/**
 * Interface que define a estrutura de um produto
 * 
 * @interface Produto
 * @property {string} id - Identificador único do produto
 * @property {string} nome - Nome do produto (ex: "Cloro Estabilizado (kg)")
 * @property {string} precoUnitario - Preço por unidade em formato brasileiro (ex: "R$ 22,00")
 * @property {string} unidade - Unidade de medida do produto (ex: "kg", "l")
 * @property {string} observacao - Notas adicionais sobre o produto ou seu uso
 */
interface Produto {
  id: string
  nome: string
  precoUnitario: string
  unidade: string
  observacao: string
}

// ==========================================
// DADOS MOCKADOS
// ==========================================

/**
 * Array com dados mockados de produtos para exibição inicial
 * 
 * Contém produtos típicos utilizados em serviços de manutenção de piscinas.
 * Em um projeto real, esses dados viriam de uma API/banco de dados.
 * 
 * @type {Produto[]}
 */
const PRODUTOS: Produto[] = [
  {
    id: '1',
    nome: 'Cloro Estabilizado (kg)',
    precoUnitario: 'R$ 22,00',
    unidade: 'kg',
    observacao: 'Ideal para piscinas residenciais.',
  },
  {
    id: '2',
    nome: 'Algicida Choque (l)',
    precoUnitario: 'R$ 45,00',
    unidade: 'l',
    observacao: 'Tratamento de choque semanal.',
  },
  {
    id: '3',
    nome: 'Clarificante (l)',
    precoUnitario: 'R$ 18,50',
    unidade: 'l',
    observacao: 'Ação rápida.',
  },
  {
    id: '4',
    nome: 'Barrilha Leve (kg)',
    precoUnitario: 'R$ 12,00',
    unidade: 'kg',
    observacao: 'Para ajuste de pH.',
  },
]

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

/**
 * Componente principal da página de produtos
 * 
 * Renderiza a interface completa de gerenciamento de produtos, incluindo:
 * 1. Header com descrição e botão para novo produto
 * 2. Tabela com lista de produtos e suas características
 * 3. Dashboard com estatísticas (total de produtos, custo médio, status)
 * 4. Modal para criar/editar produtos
 * 
 * @component
 * @returns {JSX.Element} Página completa de produtos
 */
export function ProdutosPage() {
  // ===== ESTADO DA PÁGINA =====

  /** Controla se o modal de novo produto está aberto ou fechado */
  const [modalAberto, setModalAberto] = useState(false)

  // ===== DADOS CALCULADOS =====

  /** Total de produtos cadastrados no sistema */
  const totalProdutos = PRODUTOS.length

  /** Custo médio de todos os produtos (valor calculado ou mockado) */
  const custoMedio = 'R$ 97,50'

  /** Status atual do inventário de produtos */
  const status = 'Ativo'

  return (
    <>
      {/* ===== MODAL DE NOVO PRODUTO ===== */}
      {/* 
        Modal que aparece quando usuário clica em "Novo Produto"
        Permite criar um novo produto ou editar um existente
      */}
      <NovoProdutoModal isOpen={modalAberto} onClose={() => setModalAberto(false)} />

      <div className="space-y-8">
        {/* ===== SEÇÃO 1: HEADER COM DESCRIÇÃO E BOTÃO ===== */}
        {/* 
          Cabeçalho da página que contém:
          - Descrição do que a página faz
          - Botão para criar novo produto
          
          Layout responsivo: em mobile fica empilhado, em desktop fica lado a lado
        */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Descrição da página */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Produtos
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Gerenciamento de produtos utilizados nos serviços
            </p>
          </div>

          {/* Botão para abrir modal de novo produto */}
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors w-full sm:w-auto"
          >
            <span className="material-symbols-outlined">add</span>
            Novo Produto
          </button>
        </section>

        {/* ===== SEÇÃO 2: TABELA DE PRODUTOS ===== */}
        {/* 
          Exibe todos os produtos em formato de tabela
          Cada linha contém: nome, preço, unidade, observação e ações (editar/deletar)
          A tabela é responsiva com scroll horizontal em telas pequenas
        */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <table className="w-full text-left">

            {/* CABEÇALHO DA TABELA */}
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                {/* Coluna: Nome do Produto */}
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Nome do Produto
                </th>

                {/* Coluna: Preço Unitário */}
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Preço Unitário
                </th>

                {/* Coluna: Unidade de Medida */}
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Unidade
                </th>

                {/* Coluna: Observações */}
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Observação
                </th>

                {/* Coluna: Ações (Editar/Deletar) */}
                <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>

            {/* CORPO DA TABELA */}
            <tbody className="divide-y divide-slate-200">
              {/* Itera sobre todos os produtos e cria uma linha para cada um */}
              {PRODUTOS.map((produto) => (
                <tr
                  key={produto.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* Coluna: Nome do Produto (em azul para destacar) */}
                  <td className="px-8 py-6 font-semibold text-blue-600">
                    {produto.nome}
                  </td>

                  {/* Coluna: Preço Unitário */}
                  <td className="px-8 py-6 text-slate-600">
                    {produto.precoUnitario}
                  </td>

                  {/* Coluna: Unidade com badge visual */}
                  {/* 
                    A unidade é exibida em um badge (etiqueta) com fundo ciano
                    para facilitar identificação visual da medida (kg, l, etc)
                  */}
                  <td className="px-8 py-6">
                    <span className="inline-block bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {produto.unidade}
                    </span>
                  </td>

                  {/* Coluna: Observação */}
                  {/* 
                    Notas adicionais sobre o produto (quando usar, para que usar, etc)
                    Exibida em itálico para diferenciar de outras colunas
                  */}
                  <td className="px-8 py-6 text-sm text-slate-600 italic">
                    {produto.observacao}
                  </td>

                  {/* Coluna: Ações disponíveis para o produto */}
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">

                      {/* Botão: Editar produto */}
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-100/50 transition-colors"
                        title="Editar produto"
                      >
                        <span className="material-symbols-outlined text-base">
                          edit
                        </span>
                      </button>

                      {/* Botão: Deletar produto */}
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-100/50 transition-colors"
                        title="Deletar produto"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== SEÇÃO 3: CARDS DE ESTATÍSTICAS ===== */}
        {/* 
          Dashboard com 3 cards mostrando informações resumidas:
          - Total de produtos cadastrados
          - Custo médio por unidade
          - Status do inventário
          
          Layout responsivo: 1 coluna em mobile, 3 colunas em desktop
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Total de Produtos Cadastrados */}
          <div className="bg-sky-100/30 p-8 rounded-2xl flex flex-col gap-3 border border-sky-200/50">
            {/* Ícone do card (inventário/estoque) */}
            <span className="material-symbols-outlined text-blue-600 text-2xl w-fit">
              inventory
            </span>

            {/* Número total de produtos com formatação (2 dígitos) */}
            {/* 
              padStart(2, '0') garante que números menores que 10 
              sejam exibidos com zero à esquerda (ex: "04" em vez de "4")
            */}
            <h3 className="font-bold text-3xl text-slate-900">
              {String(totalProdutos).padStart(2, '0')}
            </h3>

            {/* Rótulo descritivo do card */}
            <p className="text-sm font-medium text-slate-700">Produtos Cadastrados</p>
          </div>

          {/* Card 2: Custo Médio por Unidade */}
          <div className="bg-slate-100 p-8 rounded-2xl flex flex-col gap-3 border border-slate-200">
            {/* Ícone do card (carrinho de compras) */}
            <span className="material-symbols-outlined text-slate-600 text-2xl w-fit">
              shopping_cart
            </span>

            {/* Valor do custo médio */}
            <h3 className="font-bold text-3xl text-slate-900">{custoMedio}</h3>

            {/* Rótulo descritivo do card */}
            <p className="text-sm font-medium text-slate-700">Custo Médio p/ Unidade</p>
          </div>

          {/* Card 3: Status do Inventário */}
          {/* 
            Card com efeito hover que muda para azul claro
            Indica o status geral do inventário de produtos
          */}
          <div className="bg-slate-200/40 p-8 rounded-2xl flex flex-col gap-3 border border-slate-300/50 group hover:bg-blue-50/40 transition-colors">
            {/* Ícone do card (gráfico de crescimento) */}
            <span className="material-symbols-outlined text-purple-600 text-2xl w-fit">
              trending_up
            </span>

            {/* Status atual do inventário */}
            <h3 className="font-bold text-3xl text-slate-900">{status}</h3>

            {/* Rótulo descritivo do card */}
            <p className="text-sm font-medium text-slate-700">Status do Inventário</p>
          </div>
        </div>
      </div>
    </>
  )
}
