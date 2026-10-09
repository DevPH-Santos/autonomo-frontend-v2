'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  listarAtendimentos,
} from '@/services/atendimentoService';
import { listarPagamentos } from '@/services/pagamentoService';

type Registro = Record<string, unknown>;
type TipoItem = 'atendimento' | 'pagamento';

interface ItemCalendario {
  id: string;
  tipo: TipoItem;
  titulo: string;
  subtitulo: string;
  data: Date;
  horario?: string;
  status?: string;
  valor?: number;
  original: Registro;
}

interface CalendarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function comoRegistro(valor: unknown): Registro {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor)
    ? (valor as Registro)
    : {};
}

function primeiroCampo(registro: Registro, nomes: string[]): unknown {
  for (const nome of nomes) {
    const valor = registro[nome];
    if (valor !== undefined && valor !== null && valor !== '') return valor;
  }
  return undefined;
}

function texto(valor: unknown, fallback = ''): string {
  if (typeof valor === 'string' || typeof valor === 'number') return String(valor);
  if (valor && typeof valor === 'object') {
    const registro = comoRegistro(valor);
    const nome = primeiroCampo(registro, ['nome', 'name', 'nome_cliente', 'descricao']);
    if (nome !== undefined) return String(nome);
  }
  return fallback;
}

function extrairLista(resposta: unknown, chaves: string[]): Registro[] {
  if (Array.isArray(resposta)) return resposta.map(comoRegistro);
  const objeto = comoRegistro(resposta);
  for (const chave of chaves) {
    if (Array.isArray(objeto[chave])) return (objeto[chave] as unknown[]).map(comoRegistro);
  }
  // Algumas APIs devolvem os dados dentro de "data" ou "resultado".
  for (const chave of ['data', 'resultado', 'result']) {
    const interno = objeto[chave];
    if (Array.isArray(interno)) return interno.map(comoRegistro);
    const internoRegistro = comoRegistro(interno);
    for (const chaveLista of chaves) {
      if (Array.isArray(internoRegistro[chaveLista])) {
        return (internoRegistro[chaveLista] as unknown[]).map(comoRegistro);
      }
    }
  }
  return [];
}

/**
 * Interpreta datas ISO e datas locais sem deslocar o dia por conversão UTC.
 * Datas no formato YYYY-MM-DD são construídas como data local.
 */
function converterData(valor: unknown): Date | null {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor;
  if (typeof valor !== 'string' && typeof valor !== 'number') return null;

  if (typeof valor === 'string') {
    const dataLocal = valor.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/);
    if (dataLocal) {
      const ano = Number(dataLocal[1]);
      const mes = Number(dataLocal[2]) - 1;
      const dia = Number(dataLocal[3]);
      const data = new Date(ano, mes, dia);
      return Number.isNaN(data.getTime()) ? null : data;
    }

    const dataBR = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dataBR) {
      const data = new Date(Number(dataBR[3]), Number(dataBR[2]) - 1, Number(dataBR[1]));
      return Number.isNaN(data.getTime()) ? null : data;
    }
  }

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function chaveDia(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

function formatarMoeda(valor: unknown): string | undefined {
  if (typeof valor !== 'number' && typeof valor !== 'string') return undefined;
  const numero = typeof valor === 'number'
    ? valor
    : Number(valor.replace(/[R$\s.]/g, '').replace(',', '.'));
  if (!Number.isFinite(numero)) return undefined;
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function normalizarAtendimento(registro: Registro, indice: number): ItemCalendario | null {
  const valorData = primeiroCampo(registro, [
    'data_atendimento', 'dataAtendimento', 'data', 'dt_atendimento',
    'data_agendamento', 'dataAgendamento', 'created_at',
  ]);
  const data = converterData(valorData);
  if (!data) return null;

  const cliente = texto(primeiroCampo(registro, ['cliente', 'nome_cliente', 'cliente_nome', 'nomeCliente']), 'Cliente');
  const servico = texto(primeiroCampo(registro, ['servico', 'serviço', 'nome_servico', 'descricao', 'titulo']), 'Atendimento');
  const horario = texto(primeiroCampo(registro, ['hora_atendimento', 'horario', 'hora', 'horario_atendimento', 'hora_inicio']));
  const status = texto(primeiroCampo(registro, ['status_atendimento', 'status', 'situacao']));
  const id = texto(primeiroCampo(registro, ['ID_atendimento', 'id_atendimento', 'id', 'ID']), `atendimento-${indice}`);

  return {
    id,
    tipo: 'atendimento',
    titulo: cliente,
    subtitulo: servico,
    data,
    horario,
    status,
    original: registro,
  };
}

function normalizarPagamento(registro: Registro, indice: number): ItemCalendario | null {
  // No tipo Pagamento do projeto, a data prevista está no campo "data"
  // e o status em "status" ("Pago" | "Pendente" | "Atrasado").
  const valorData = primeiroCampo(registro, [
    'data',
    'data_pgto',
    'data_prevista_recebimento',
    'dataPrevistaRecebimento',
    'data_agendada',
    'data_agendamento',
    'data_prevista',
    'data_pagamento_prevista',
    'data_recebimento',
    'data_pagamento',
    'data_vencimento',
  ]);
  const data = converterData(valorData);
  if (!data) return null;

  const statusOriginal = texto(
    primeiroCampo(registro, ['status', 'status_pgto', 'status_pagamento', 'situacao']),
    'Pendente',
  );
  const statusNormalizado = statusOriginal.trim().toLocaleLowerCase('pt-BR');

  // Pagamentos já recebidos não aparecem como pendência.
  if (statusNormalizado === 'pago' || statusNormalizado === 'paga') return null;

  // Um pagamento não pago cuja data já passou é considerado atrasado,
  // mesmo que a API ainda o retorne como "Pendente".
  const hoje = new Date();
  const hojeLocal = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dataPagamentoLocal = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const atrasado = statusNormalizado === 'atrasado' || dataPagamentoLocal < hojeLocal;
  const statusExibicao = atrasado ? 'Atrasado' : 'Pendente';

  const descricao = texto(
    primeiroCampo(registro, ['descricao', 'descrição', 'nome', 'titulo', 'servico', 'serviço', 'forma']),
    'Pagamento',
  );
  const cliente = texto(primeiroCampo(registro, ['cliente', 'nome_cliente', 'cliente_nome', 'nomeCliente']));
  const valor = primeiroCampo(registro, ['valor', 'valor_pgto', 'valor_pagamento', 'total']);
  const id = texto(primeiroCampo(registro, ['id', 'ID_pgto', 'id_pgto', 'id_pagamento', 'ID']), `pagamento-${indice}`);

  return {
    id,
    tipo: 'pagamento',
    titulo: cliente || descricao,
    subtitulo: cliente ? descricao : 'Recebimento pendente',
    data,
    status: statusExibicao,
    valor: typeof valor === 'number' ? valor : undefined,
    original: registro,
  };
}

export default function CalendarioModal({ isOpen, onClose }: CalendarioModalProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const hoje = useMemo(() => new Date(), []);
  const [mesVisivel, setMesVisivel] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [diaSelecionado, setDiaSelecionado] = useState(() => chaveDia(hoje));
  const [itens, setItens] = useState<ItemCalendario[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const [resAtendimentos, resPagamentos] = await Promise.all([
        listarAtendimentos(),
        listarPagamentos(),
      ]);

      const atendimentos = extrairLista(resAtendimentos, ['atendimentos', 'items', 'dados']);
      const pagamentos = extrairLista(resPagamentos, ['pagamentos', 'items', 'dados']);

      const itensAtendimento = atendimentos
        .map(normalizarAtendimento)
        .filter((item): item is ItemCalendario => item !== null);
      const itensPagamento = pagamentos
        .map(normalizarPagamento)
        .filter((item): item is ItemCalendario => item !== null);

      setItens([...itensAtendimento, ...itensPagamento]);
    } catch (e) {
      console.error('Erro ao carregar dados do calendário:', e);
      setErro('Não foi possível carregar os atendimentos e pagamentos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) void carregarDados();
  }, [isOpen, carregarDados]);

  useEffect(() => {
    if (!isOpen) return;

    const tratarTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const tratarCliqueFora = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) onClose();
    };

    document.addEventListener('keydown', tratarTecla);
    document.addEventListener('mousedown', tratarCliqueFora);
    return () => {
      document.removeEventListener('keydown', tratarTecla);
      document.removeEventListener('mousedown', tratarCliqueFora);
    };
  }, [isOpen, onClose]);

  const itensPorDia = useMemo(() => {
    const mapa = new Map<string, ItemCalendario[]>();
    for (const item of itens) {
      const chave = chaveDia(item.data);
      mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => (a.horario ?? '').localeCompare(b.horario ?? ''));
    }
    return mapa;
  }, [itens]);

  const diasDoMes = useMemo(() => {
    const ano = mesVisivel.getFullYear();
    const mes = mesVisivel.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const totalCelulas = Math.ceil((primeiroDia + totalDias) / 7) * 7;

    return Array.from({ length: totalCelulas }, (_, indice) => {
      const numeroDia = indice - primeiroDia + 1;
      if (numeroDia < 1 || numeroDia > totalDias) return null;
      return new Date(ano, mes, numeroDia);
    });
  }, [mesVisivel]);

  const itensSelecionados = itensPorDia.get(diaSelecionado) ?? [];

  const mudarMes = (quantidade: number) => {
    setMesVisivel((atual) => new Date(atual.getFullYear(), atual.getMonth() + quantidade, 1));
  };

  const selecionarDia = (data: Date) => setDiaSelecionado(chaveDia(data));

  const abrirItem = (item: ItemCalendario) => {
    onClose();
    router.push(item.tipo === 'atendimento' ? '/atendimentos' : '/pagamentos');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Calendário de atendimentos e pagamentos"
      aria-modal="false"
      className="absolute right-0 top-full z-[70] mt-2 w-[min(94vw,360px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Calendário</p>
          <p className="mt-0.5 text-xs text-slate-500">Seus compromissos e recebimentos</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar calendário"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => mudarMes(-1)}
            aria-label="Mês anterior"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold capitalize text-slate-900">
            {MESES[mesVisivel.getMonth()]} {mesVisivel.getFullYear()}
          </h2>
          <button
            type="button"
            onClick={() => mudarMes(1)}
            aria-label="Próximo mês"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="pb-2 text-center text-[10px] font-semibold tracking-wide text-slate-400">
              {dia}
            </div>
          ))}

          {diasDoMes.map((data, indice) => {
            if (!data) return <div key={`vazio-${indice}`} className="h-10" />;

            const chave = chaveDia(data);
            const itensDia = itensPorDia.get(chave) ?? [];
            const temAtendimento = itensDia.some((item) => item.tipo === 'atendimento');
            const temPagamentoPendente = itensDia.some(
              (item) => item.tipo === 'pagamento' && item.status !== 'Atrasado',
            );
            const temPagamentoAtrasado = itensDia.some(
              (item) => item.tipo === 'pagamento' && item.status === 'Atrasado',
            );
            const selecionado = chave === diaSelecionado;
            const ehHoje = chave === chaveDia(hoje);

            return (
              <button
                key={chave}
                type="button"
                onClick={() => selecionarDia(data)}
                aria-label={`${data.getDate()} de ${MESES[data.getMonth()]}, ${itensDia.length} pendência(s)`}
                aria-pressed={selecionado}
                className={`mx-auto flex h-10 w-9 flex-col items-center justify-center rounded-xl transition ${
                  selecionado
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : ehHoje
                      ? 'bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs leading-4">{data.getDate()}</span>
                <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                  {temAtendimento && <span className={`h-1.5 w-1.5 rounded-full ${selecionado ? 'bg-white' : 'bg-blue-500'}`} />}
                  {temPagamentoPendente && <span title="Pagamento pendente" className={`h-1.5 w-1.5 rounded-full ${selecionado ? 'bg-emerald-200' : 'bg-emerald-500'}`} />}
                  {temPagamentoAtrasado && <span title="Pagamento atrasado" className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Atendimentos
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Pagamentos pendentes
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Pagamentos atrasados
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-800">
              {new Date(`${diaSelecionado}T12:00:00`).toLocaleDateString('pt-BR', {
                weekday: 'long', day: '2-digit', month: 'long',
              })}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {itensSelecionados.length} {itensSelecionados.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
          {carregando && (
            <span className="text-[11px] text-slate-400">Atualizando...</span>
          )}
        </div>

        <div className="max-h-52 overflow-y-auto px-3 pb-3">
          {erro ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-xs text-red-600">
              {erro}
              <button type="button" onClick={() => void carregarDados()} className="ml-1 font-semibold underline">
                Tentar novamente
              </button>
            </div>
          ) : !carregando && itensSelecionados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-5 text-center">
              <p className="text-xs font-medium text-slate-600">Nada previsto para este dia</p>
              <p className="mt-1 text-[11px] text-slate-400">Selecione outra data para consultar.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {itensSelecionados.map((item) => (
                <button
                  key={`${item.tipo}-${item.id}`}
                  type="button"
                  onClick={() => abrirItem(item)}
                  className="flex w-full items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left transition hover:border-slate-200 hover:shadow-sm"
                >
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.tipo === 'atendimento' ? 'bg-blue-500' : item.status === 'Atrasado' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-slate-800">{item.titulo}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">{item.subtitulo}</span>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {item.tipo === 'atendimento' ? 'Atendimento' : item.status === 'Atrasado' ? 'Pagamento atrasado' : 'Pagamento pendente'}
                      {item.horario ? ` · ${item.horario}` : ''}
                      {item.status ? ` · ${item.status}` : ''}
                    </span>
                  </span>
                  {item.valor !== undefined && (
                    <span className="shrink-0 text-xs font-semibold text-emerald-700">
                      {formatarMoeda(item.valor)}
                    </span>
                  )}
                  <svg viewBox="0 0 24 24" fill="none" className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
