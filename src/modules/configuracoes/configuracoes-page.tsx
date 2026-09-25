'use client';

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/icon';
import { logout, obterUsuarioLogado } from '@/services/authService';
import {
  exportarDadosLocais,
  MOEDAS_SUPORTADAS,
  obterConfiguracoes,
  salvarConfiguracoes,
  salvarMoedaComCotacao,
  type CodigoMoeda,
  type PreferenciasLembretes,
} from '@/services/configuracoesService';

type Aba = 'perfil' | 'negocio' | 'lembretes' | 'conta';
type ModalAberto = 'foto' | 'senha' | 'excluir' | null;
type DadosPerfil = {
  nome: string;
  email: string;
  telefone: string;
};

const ABAS: { id: Aba; titulo: string; icone: IconName }[] = [
  { id: 'perfil', titulo: 'Meu perfil', icone: 'person' },
  { id: 'negocio', titulo: 'Negócio', icone: 'handyman' },
  { id: 'lembretes', titulo: 'Lembretes', icone: 'notifications' },
  { id: 'conta', titulo: 'Conta', icone: 'settings' },
];

const CLASSE_CAMPO =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600';

const CLASSE_BOTAO_SECUNDARIO =
  'rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50';

function obterIniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) return 'US';
  if (partes.length === 1) return partes[0].slice(0, 1).toUpperCase();

  return `${partes[0][0]}${partes.at(-1)?.[0] ?? ''}`.toUpperCase();
}

export function ConfiguracoesPage() {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<Aba>('perfil');
  const [modalAberto, setModalAberto] = useState<ModalAberto>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [salvandoMoeda, setSalvandoMoeda] = useState(false);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [moeda, setMoeda] = useState<CodigoMoeda>('BRL');
  const [preferenciasLembretes, setPreferenciasLembretes] =
    useState<PreferenciasLembretes>({
      ativo: true,
      pagamentos: '1',
      atendimentos: '1',
      lembretes: '1',
    });
  const [perfil, setPerfil] = useState<DadosPerfil>({
    nome: 'Pedro Santos',
    email: 'pedro@email.com',
    telefone: '(11) 98765-4321',
  });
  const [perfilOriginal, setPerfilOriginal] = useState(perfil);

  useEffect(() => {
    const configuracoes = obterConfiguracoes();
    const usuario = obterUsuarioLogado();

    queueMicrotask(() => {
      setMoeda(configuracoes.moeda);
      setNotificacoesAtivas(configuracoes.lembretes.ativo);
      setPreferenciasLembretes(configuracoes.lembretes);

      if (!usuario) return;

      const dadosDoUsuario = {
        ...perfil,
        nome: usuario.nome,
        email: usuario.email,
      };

      setPerfil(dadosDoUsuario);
      setPerfilOriginal(dadosDoUsuario);
    });

    // A leitura ocorre apenas no navegador: a autenticação é salva localmente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;

    const temporizador = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(temporizador);
  }, [toast]);

  const iniciais = useMemo(() => obterIniciais(perfil.nome), [perfil.nome]);

  function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPerfilOriginal(perfil);
    setToast('Alterações salvas com sucesso.');
  }

  function mostrarMensagemAoSalvar(
    event: FormEvent<HTMLFormElement>,
    mensagem: string
  ) {
    event.preventDefault();
    setToast(mensagem);
  }

  async function salvarNegocio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvandoMoeda(true);

    try {
      await salvarMoedaComCotacao(moeda, preferenciasLembretes);
      setToast(
        moeda === 'BRL'
          ? 'Informações do negócio salvas com sucesso.'
          : 'Informações salvas e cotação atualizada com sucesso.'
      );
    } catch {
      setToast('Não foi possível atualizar a cotação. Tente novamente.');
    } finally {
      setSalvandoMoeda(false);
    }
  }

  return (
    <div className="mx-auto max-w-[960px] pb-12">
      <CabecalhoPerfil iniciais={iniciais} perfil={perfil} />

      <NavegacaoAbas
        abaAtiva={abaAtiva}
        aoSelecionarAba={setAbaAtiva}
      />

      {abaAtiva === 'perfil' && (
        <AbaPerfil
          iniciais={iniciais}
          perfil={perfil}
          aoAbrirModalFoto={() => setModalAberto('foto')}
          aoAlterarPerfil={setPerfil}
          aoRemoverFoto={() =>
            setToast('Foto removida. Utilizando as iniciais padrão.')
          }
          aoRestaurarPerfil={() => {
            setPerfil(perfilOriginal);
            setToast('Formulário restaurado.');
          }}
          aoSalvar={salvarPerfil}
        />
      )}

      {abaAtiva === 'negocio' && (
        <AbaNegocio
          moeda={moeda}
          salvando={salvandoMoeda}
          aoMudarMoeda={setMoeda}
          aoCancelar={() => setToast('Alterações não salvas foram descartadas.')}
          aoSalvar={salvarNegocio}
        />
      )}

      {abaAtiva === 'lembretes' && (
        <AbaLembretes
          notificacoesAtivas={notificacoesAtivas}
          preferencias={preferenciasLembretes}
          aoMudarNotificacoes={(ativo) => {
            setNotificacoesAtivas(ativo);
            setPreferenciasLembretes({ ...preferenciasLembretes, ativo });
          }}
          aoMudarPreferencia={(chave, valor) =>
            setPreferenciasLembretes({ ...preferenciasLembretes, [chave]: valor })
          }
          aoSalvar={(event) =>
            {mostrarMensagemAoSalvar(event, 'Preferências de lembretes salvas com sucesso.'); salvarConfiguracoes({ ...obterConfiguracoes(), moeda, lembretes: preferenciasLembretes });}
          }
        />
      )}

      {abaAtiva === 'conta' && (
        <AbaConta
          aoAbrirModalSenha={() => setModalAberto('senha')}
          aoAbrirModalExcluir={() => setModalAberto('excluir')}
          aoExportar={() => { exportarDadosLocais(); setToast('Arquivo com seus dados locais foi baixado.'); }}
          aoSair={() => { logout(); router.push('/login'); }}
        />
      )}

      {modalAberto && (
        <Modal
          tipo={modalAberto}
          aoFechar={() => setModalAberto(null)}
          aoConfirmar={(mensagem) => {
            setModalAberto(null);
            setToast(mensagem);
          }}
        />
      )}

      {toast && <Toast mensagem={toast} />}
    </div>
  );
}

function CabecalhoPerfil({
  iniciais,
  perfil,
}: {
  iniciais: string;
  perfil: { nome: string; email: string };
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Gerencie os dados da sua conta e as preferências do seu negócio.
        </p>
      </div>

      <div className="inline-flex items-center gap-3 self-start rounded-xl border border-slate-200 bg-white p-2 pr-4 shadow-sm md:self-auto">
        <Avatar iniciais={iniciais} tamanho="pequeno" />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">{perfil.nome}</p>
          <p className="text-xs text-slate-500">{perfil.email}</p>
        </div>
      </div>
    </div>
  );
}

function NavegacaoAbas({
  abaAtiva,
  aoSelecionarAba,
}: {
  abaAtiva: Aba;
  aoSelecionarAba: (aba: Aba) => void;
}) {
  return (
    <div className="mt-6 overflow-x-auto border-b border-slate-200">
      <nav className="flex min-w-max gap-2 sm:gap-8" aria-label="Configurações">
        {ABAS.map((aba) => {
          const estaAtiva = abaAtiva === aba.id;

          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => aoSelecionarAba(aba.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition sm:px-1 ${
                estaAtiva
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <Icon name={aba.icone} className="h-5 w-5" />
              {aba.titulo}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function AbaPerfil({
  iniciais,
  perfil,
  aoAbrirModalFoto,
  aoAlterarPerfil,
  aoRemoverFoto,
  aoRestaurarPerfil,
  aoSalvar,
}: {
  iniciais: string;
  perfil: DadosPerfil;
  aoAbrirModalFoto: () => void;
  aoAlterarPerfil: (perfil: DadosPerfil) => void;
  aoRemoverFoto: () => void;
  aoRestaurarPerfil: () => void;
  aoSalvar: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <TituloSecao
        titulo="Dados pessoais"
        descricao="Estas informações aparecem nos seus documentos e comunicações."
      />

      <form className="mt-8 space-y-6" onSubmit={aoSalvar}>
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
          <Avatar iniciais={iniciais} tamanho="grande" />
          <div>
            <p className="text-sm font-medium text-slate-800">Foto de perfil</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Formatos suportados: PNG, JPG ou WEBP (máx. 2 MB).
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={aoAbrirModalFoto}
                className={`${CLASSE_BOTAO_SECUNDARIO} inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs`}
              >
                <Icon name="image" className="h-4 w-4" />
                Alterar foto
              </button>
              <button
                type="button"
                onClick={aoRemoverFoto}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-red-600"
              >
                Remover
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CampoRotulado titulo="Nome completo" className="md:col-span-2">
            <input
              required
              value={perfil.nome}
              onChange={(event) =>
                aoAlterarPerfil({ ...perfil, nome: event.target.value })
              }
              className={CLASSE_CAMPO}
            />
          </CampoRotulado>

          <CampoRotulado titulo="E-mail">
            <input
              required
              type="email"
              value={perfil.email}
              onChange={(event) =>
                aoAlterarPerfil({ ...perfil, email: event.target.value })
              }
              className={CLASSE_CAMPO}
            />
          </CampoRotulado>

          <CampoRotulado titulo="Telefone / WhatsApp">
            <input
              required
              type="tel"
              value={perfil.telefone}
              onChange={(event) =>
                aoAlterarPerfil({ ...perfil, telefone: event.target.value })
              }
              className={CLASSE_CAMPO}
            />
          </CampoRotulado>
        </div>

        <AcoesFormulario aoCancelar={aoRestaurarPerfil} />
      </form>
    </section>
  );
}

function AbaNegocio({
  moeda,
  salvando,
  aoMudarMoeda,
  aoCancelar,
  aoSalvar,
}: {
  moeda: CodigoMoeda;
  salvando: boolean;
  aoMudarMoeda: (moeda: CodigoMoeda) => void;
  aoCancelar: () => void;
  aoSalvar: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <TituloSecao
        titulo="Informações do negócio"
        descricao="Use estes dados em comprovantes, cobranças e documentos."
      />

      <form className="mt-8 space-y-6" onSubmit={aoSalvar}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CampoRotulado titulo="Nome do negócio" className="md:col-span-2">
            <input
              required
              defaultValue="Pedro Piscinas & Manutenção"
              className={CLASSE_CAMPO}
            />
          </CampoRotulado>

          <CampoRotulado titulo="CPF ou CNPJ" opcional>
            <input defaultValue="38.921.405/0001-82" className={CLASSE_CAMPO} />
          </CampoRotulado>

          <CampoRotulado titulo="Chave Pix para recebimentos">
            <input defaultValue="pedro@email.com" className={CLASSE_CAMPO} />
          </CampoRotulado>

          <CampoRotulado titulo="Cidade">
            <input required defaultValue="São Paulo" className={CLASSE_CAMPO} />
          </CampoRotulado>

          <CampoRotulado titulo="Estado">
            <select defaultValue="SP" className={CLASSE_CAMPO}>
              <option value="SP">São Paulo (SP)</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="MG">Minas Gerais (MG)</option>
              <option value="PR">Paraná (PR)</option>
              <option value="SC">Santa Catarina (SC)</option>
            </select>
          </CampoRotulado>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-800">
            Preferências de cobrança
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Defina padrões para a emissão de cobranças.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <CampoRotulado titulo="Moeda padrão">
              <select
                value={moeda}
                onChange={(event) => aoMudarMoeda(event.target.value as CodigoMoeda)}
                className={CLASSE_CAMPO}
              >
                {Object.values(MOEDAS_SUPORTADAS).map((opcao) => (
                  <option key={opcao.codigo} value={opcao.codigo}>
                    {opcao.nome} ({opcao.simbolo})
                  </option>
                ))}
              </select>
            </CampoRotulado>

            <CampoRotulado titulo="Vencimento padrão">
              <select defaultValue="7" className={CLASSE_CAMPO}>
                <option value="0">No mesmo dia</option>
                <option value="7">7 dias</option>
                <option value="15">15 dias</option>
                <option value="30">30 dias</option>
              </select>
            </CampoRotulado>
          </div>
        </div>

        <AcoesFormulario
          aoCancelar={aoCancelar}
          textoSalvar={salvando ? 'Atualizando cotação...' : 'Salvar alterações'}
          desabilitado={salvando}
        />
      </form>
    </section>
  );
}

function AbaLembretes({
  notificacoesAtivas,
  preferencias,
  aoMudarNotificacoes,
  aoMudarPreferencia,
  aoSalvar,
}: {
  notificacoesAtivas: boolean;
  preferencias: PreferenciasLembretes;
  aoMudarNotificacoes: (ativo: boolean) => void;
  aoMudarPreferencia: (
    chave: 'pagamentos' | 'atendimentos' | 'lembretes',
    valor: string
  ) => void;
  aoSalvar: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <TituloSecao
        titulo="Notificações e lembretes"
        descricao="Escolha sobre quais situações você quer ser avisado."
      />

      <form className="mt-8 space-y-6" onSubmit={aoSalvar}>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Icon name="notifications_active" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Receber notificações
              </p>
              <p className="text-xs text-slate-500">
                Habilite os avisos importantes para o seu dia.
              </p>
            </div>
          </div>

          <Interruptor
            ativo={notificacoesAtivas}
            aoMudar={aoMudarNotificacoes}
            rotulo="Receber notificações"
          />
        </div>

        <div
          className={`space-y-3 transition-opacity ${
            notificacoesAtivas ? 'opacity-100' : 'pointer-events-none opacity-40'
          }`}
        >
          <OpcaoLembrete
            titulo="Pagamentos próximos do vencimento"
            descricao="Receba um aviso antes de uma cobrança vencer."
            desabilitado={!notificacoesAtivas}
            antecedencia={preferencias.pagamentos}
            aoMudarAntecedencia={(valor) => aoMudarPreferencia('pagamentos', valor)}
          />
          <OpcaoLembrete
            titulo="Atendimentos agendados"
            descricao="Não perca os serviços marcados na sua agenda."
            desabilitado={!notificacoesAtivas}
            antecedencia={preferencias.atendimentos}
            aoMudarAntecedencia={(valor) => aoMudarPreferencia('atendimentos', valor)}
          />
          <OpcaoLembrete
            titulo="Lembretes cadastrados"
            descricao="Seja avisado sobre tarefas que você programou."
            desabilitado={!notificacoesAtivas}
            antecedencia={preferencias.lembretes}
            aoMudarAntecedencia={(valor) => aoMudarPreferencia('lembretes', valor)}
          />
        </div>

        <div className="border-t border-slate-100 pt-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700"
          >
            <Icon name="save" className="h-4 w-4" />
            Salvar preferências
          </button>
        </div>
      </form>
    </section>
  );
}

function AbaConta({
  aoAbrirModalSenha,
  aoAbrirModalExcluir,
  aoExportar,
  aoSair,
}: {
  aoAbrirModalSenha: () => void;
  aoAbrirModalExcluir: () => void;
  aoExportar: () => void;
  aoSair: () => void;
}) {
  return (
    <section className="mt-8 space-y-6">
      <Cartao titulo="Segurança" descricao="Mantenha sua conta protegida.">
        <LinhaAcao
          icone="visibility"
          titulo="Senha de acesso"
          descricao="Última alteração há 3 meses"
          acao="Alterar senha"
          aoClicar={aoAbrirModalSenha}
        />
      </Cartao>

      <Cartao titulo="Dados" descricao="Baixe uma cópia dos seus dados.">
        <LinhaAcao
          icone="download"
          titulo="Exportação em lote"
          descricao="Clientes, serviços e pagamentos em CSV."
          acao="Exportar dados"
          aoClicar={aoExportar}
        />
      </Cartao>

      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 text-red-700">
          <Icon name="warning" />
          <h2 className="text-lg font-semibold">Zona de perigo</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Ações que afetam a continuidade do seu acesso e dos seus registros.
        </p>

        <div className="mt-6 divide-y divide-slate-100">
          <LinhaAcao
            icone="logout"
            titulo="Sair da conta"
            descricao="Encerra a sessão atual neste navegador."
            acao="Sair da conta"
            aoClicar={aoSair}
          />
          <LinhaAcao
            vermelho
            icone="delete"
            titulo="Excluir conta"
            descricao="Esta ação é permanente e não poderá ser desfeita."
            acao="Excluir conta"
            aoClicar={aoAbrirModalExcluir}
          />
        </div>
      </div>
    </section>
  );
}

function TituloSecao({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{titulo}</h2>
      <p className="mt-1 text-sm text-slate-500">{descricao}</p>
    </div>
  );
}

function Avatar({
  iniciais,
  tamanho,
}: {
  iniciais: string;
  tamanho: 'pequeno' | 'grande';
}) {
  const classeTamanho =
    tamanho === 'grande' ? 'h-20 w-20 text-2xl' : 'h-10 w-10 text-sm';

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-blue-600 font-semibold text-white ring-2 ring-blue-100 ${classeTamanho}`}
    >
      {iniciais}
    </div>
  );
}

function CampoRotulado({
  titulo,
  opcional = false,
  className = '',
  children,
}: {
  titulo: string;
  opcional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-600">
        {titulo}
        {opcional && (
          <em className="normal-case font-normal text-slate-400">Opcional</em>
        )}
      </span>
      {children}
    </label>
  );
}

function AcoesFormulario({
  aoCancelar,
  textoSalvar = 'Salvar alterações',
  desabilitado = false,
}: {
  aoCancelar: () => void;
  textoSalvar?: string;
  desabilitado?: boolean;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
      <button type="button" onClick={aoCancelar} disabled={desabilitado} className={CLASSE_BOTAO_SECUNDARIO}>
        Cancelar
      </button>
      <button
        type="submit"
        disabled={desabilitado}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700"
      >
        <Icon name="save" className="h-4 w-4" />
        {textoSalvar}
      </button>
    </div>
  );
}

function Interruptor({
  ativo,
  aoMudar,
  rotulo,
}: {
  ativo: boolean;
  aoMudar: (ativo: boolean) => void;
  rotulo: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={rotulo}
      onClick={() => aoMudar(!ativo)}
      className={`relative h-6 w-11 rounded-full transition ${
        ativo ? 'bg-blue-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
          ativo ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

function OpcaoLembrete({
  titulo,
  descricao,
  desabilitado,
  antecedencia,
  aoMudarAntecedencia,
}: {
  titulo: string;
  descricao: string;
  desabilitado: boolean;
  antecedencia: string;
  aoMudarAntecedencia: (valor: string) => void;
}) {
  const [selecionado, setSelecionado] = useState(true);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={selecionado}
          disabled={desabilitado}
          onChange={(event) => setSelecionado(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-blue-600"
        />
        <span>
          <span className="block text-sm font-medium text-slate-900">{titulo}</span>
          <span className="block text-xs text-slate-500">{descricao}</span>
        </span>
      </label>

      <select
        disabled={!selecionado || desabilitado}
        value={antecedencia}
        onChange={(event) => aoMudarAntecedencia(event.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="0">No mesmo dia</option>
        <option value="30m">30 minutos antes</option>
        <option value="1h">1 hora antes</option>
        <option value="2h">2 horas antes</option>
        <option value="1">1 dia antes</option>
        <option value="3">3 dias antes</option>
        <option value="7">7 dias antes</option>
      </select>
    </div>
  );
}

function Cartao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <TituloSecao titulo={titulo} descricao={descricao} />
      <div className="mt-6">{children}</div>
    </div>
  );
}

function LinhaAcao({
  icone,
  titulo,
  descricao,
  acao,
  aoClicar,
  vermelho = false,
}: {
  icone: IconName;
  titulo: string;
  descricao: string;
  acao: string;
  aoClicar: () => void;
  vermelho?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="flex gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            vermelho ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
          }`}
        >
          <Icon name={icone} className="h-5 w-5" />
        </div>
        <div>
          <p className={`text-sm font-medium ${vermelho ? 'text-red-700' : 'text-slate-900'}`}>
            {titulo}
          </p>
          <p className="text-xs text-slate-500">{descricao}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={aoClicar}
        className={
          vermelho
            ? 'self-start rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 sm:self-auto'
            : 'self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto'
        }
      >
        {acao}
      </button>
    </div>
  );
}

function Modal({
  tipo,
  aoFechar,
  aoConfirmar,
}: {
  tipo: Exclude<ModalAberto, null>;
  aoFechar: () => void;
  aoConfirmar: (mensagem: string) => void;
}) {
  const excluirConta = tipo === 'excluir';
  const alterarSenha = tipo === 'senha';
  const titulo = excluirConta
    ? 'Excluir sua conta?'
    : alterarSenha
      ? 'Alterar senha'
      : 'Alterar foto de perfil';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) aoFechar();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <Icon name="close" />
        </button>

        <h3
          id="titulo-modal"
          className={`text-lg font-bold ${excluirConta ? 'text-red-700' : 'text-slate-900'}`}
        >
          {titulo}
        </h3>

        {excluirConta && (
          <>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Esta ação é irreversível. Todos os seus{' '}
              <strong>clientes, atendimentos, pagamentos, despesas e demais dados</strong>{' '}
              serão removidos permanentemente.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={aoFechar} className={CLASSE_BOTAO_SECUNDARIO}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => aoConfirmar('Conta agendada para exclusão com sucesso.')}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Sim, excluir conta
              </button>
            </div>
          </>
        )}

        {alterarSenha && (
          <form
            className="mt-5 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              aoConfirmar('Senha alterada com sucesso!');
            }}
          >
            <input required type="password" placeholder="Senha atual" className={CLASSE_CAMPO} />
            <input
              required
              minLength={8}
              type="password"
              placeholder="Nova senha (mínimo 8 caracteres)"
              className={CLASSE_CAMPO}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={aoFechar} className={CLASSE_BOTAO_SECUNDARIO}>
                Cancelar
              </button>
              <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Salvar nova senha
              </button>
            </div>
          </form>
        )}

        {tipo === 'foto' && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => aoConfirmar('Foto de perfil atualizada com sucesso!')}
              className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-blue-600 transition hover:border-blue-400"
            >
              <Icon name="image" className="mb-2 h-8 w-8" />
              <span className="block">Clique para enviar uma foto</span>
              <span className="mt-1 block text-xs font-normal text-slate-400">
                PNG, JPG ou WEBP até 2 MB
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Toast({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl"
    >
      <Icon name="sucess" className="text-emerald-400" />
      {mensagem}
    </div>
  );
}
