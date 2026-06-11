'use client'

import Grafico from "@/components/ui/grafico";

export function DashboardPage() {

  return (

    <>

      <div className="header-dashboard">
        <div>
          <h3>Visão Geral</h3>
          <p>Situação das operações de serviço de piscina do mês atual.</p>
        </div>

        {/**
             * Alerta de pagamentos pendentes.
             * Substituir o texto estático por dado dinâmico proveniente da API.
             */}
        <p className="messageStatusPayment" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">error</span>
          2 clientes com pagamento pendente
        </p>
      </div>

      {/* --------------------------------------------------------------
              CARDS DE RESUMO FINANCEIRO
              Exibe: receita, lucro, total a receber e total de atendimentos.
          -------------------------------------------------------------- */}
      <div className="gains-cards-dashboard">

        {/* Card — Receita Mensal */}
        <div className="gain-card">
          <div className="header-gain-card">
            <div className="icon">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div className="increase-porcent">
              <span className="material-symbols-outlined">trending_up</span>
              5%
            </div>
          </div>
          <div className="gain-card-info">
            <p>RECEITA MENSAL</p>
            <h4>4.500,00</h4>
          </div>
        </div>

        {/* Card — Lucro Mensal */}
        <div className="gain-card">
          <div className="header-gain-card">
            <div className="icon">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            {/*
                  Tendência atual: estável (0%).
                  Trocar o ícone por trending_up / trending_down conforme dado real.
                */}
            <div className="increase-porcent">
              <span className="material-symbols-outlined">trending_flat</span>
              0%
            </div>
          </div>
          <div className="gain-card-info">
            <p>LUCRO MENSAL</p>
            <h4>2.800,00</h4>
          </div>
        </div>

        {/* Card — Total a Receber */}
        <div className="gain-card">
          <div className="header-gain-card">
            <div className="icon">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <div className="gain-card-info">
            <p>TOTAL PARA RECEBER</p>
            <h4>1.200,00</h4>
          </div>
        </div>

        {/* Card — Total de Atendimentos */}
        <div className="gain-card">
          <div className="header-gain-card">
            <div className="icon">
              <span className="material-symbols-outlined">event</span>
            </div>
          </div>
          <div className="gain-card-info">
            <p>TOTAL DE ATENDIMENTOS</p>
            <h4>42</h4>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------
              ESTATÍSTICAS — Gráfico + Ranking de Clientes
          -------------------------------------------------------------- */}
      <div className="overview-statistics-dashboard">

        {/* ---- Gráfico de Área — Desempenho da Receita ---- */}
        <div className="dashboard-chart">
          <div className="header-chart">
            <div>
              <h4>Desempenho da receita</h4>
              <p>Resumo semanal para abril</p>
            </div>
            <div>
              {/*
                    TODO: conectar esses botões a um estado para alternar
                    entre visualização diária e semanal dos dados do gráfico.
                  */}
              <button className="selected">Mensalmente</button>
              <button>Anualmente</button>
            </div>
          </div>

          {/**
               * Gráfico de área responsivo utilizando Recharts.
               *
               * - `ResponsiveContainer` garante adaptação ao contêiner pai.
               * - O gradiente `colorReceita` aplica preenchimento suave abaixo da linha.
               * - `type="natural"` suaviza a curva com interpolação cúbica.
               *
               * @see {@link https://recharts.org/en-US/api/AreaChart} Recharts AreaChart
               */}

          <Grafico/>

        </div>

        {/* ---- Ranking de Top Clientes ---- */}
        <div className="clients-rank-dashboard">
          <h4>Top Clientes</h4>

          <div className="clients-list-rank">

            {/**
                 * Item de ranking — cliente #1 (destaque azul).
                 * TODO: mapear lista dinâmica de clientes via `.map()`.
                 */}
            <div className="client-item-rank">
              <div className="client-left">
                <div className="client-position first">1</div>
                <div className="client-info-item">
                  <h5>João Silva</h5>
                  <p>Serviço residencial</p>
                </div>
              </div>
              <div className="revenue-client-item">
                <span className="value">R$800,00</span>
                <span>RECEITA</span>
              </div>
            </div>

            {/* Item de ranking — cliente #2 */}
            <div className="client-item-rank">
              <div className="client-left">
                <div className="client-position">2</div>
                <div className="client-info-item">
                  <h5>João Silva</h5>
                  <p>Serviço residencial</p>
                </div>
              </div>
              <div className="revenue-client-item">
                <span className="value">R$800,00</span>
                <span>RECEITA</span>
              </div>
            </div>

            {/* Item de ranking — cliente #3 */}
            <div className="client-item-rank">
              <div className="client-left">
                <div className="client-position">3</div>
                <div className="client-info-item">
                  <h5>João Silva</h5>
                  <p>Serviço residencial</p>
                </div>
              </div>
              <div className="revenue-client-item">
                <span className="value">R$800,00</span>
                <span>RECEITA</span>
              </div>
            </div>
          </div>

          <a href="#">Ver lista completa</a>
        </div>
      </div>

      {/* --------------------------------------------------------------
              ROTAS DO DIA
              Lista os atendimentos programados para a data atual.
          -------------------------------------------------------------- */}
      <div className="overview-daily-routes">
        <header>
          <h4>Rotas de Hoje</h4>
          <a href="#" aria-label="Ver mapa de rotas">
            Ver no mapa
            <span className="material-symbols-outlined" aria-hidden="true">map</span>
          </a>
        </header>

        {/**
             * Lista de rotas agendadas.
             * TODO: substituir por dados dinâmicos da API de agendamentos,
             * iterando com `.map()` sobre um array de objetos de rota.
             *
             * @typedef {Object} Route
             * @property {string} hour      - Hora no formato "HH:MM".
             * @property {string} period    - "AM" ou "PM".
             * @property {string} objective - Descrição do serviço a realizar.
             * @property {string} address   - Endereço do cliente.
             */}
        <div className="routes-list">

          {/* Rota — 09:00 AM */}
          <div className="route">
            <div className="route-time">
              <span className="hour">09:00</span>
              <span className="period">AM</span>
            </div>
            <div className="informations-route">
              <p className="objective-visit">Peneiração</p>
              <p className="client-address">Rua Santiago, 23B</p>
            </div>
          </div>

          {/* Rota — 11:30 AM */}
          <div className="route">
            <div className="route-time">
              <span className="hour">11:30</span>
              <span className="period">AM</span>
            </div>
            <div className="informations-route">
              <p className="objective-visit">Limpeza de Borda</p>
              <p className="client-address">Rua Bento Alves de Godoy, 223A</p>
            </div>
          </div>

          {/* Rota — 02:15 PM */}
          <div className="route">
            <div className="route-time">
              <span className="hour">14:15</span>
              <span className="period">PM</span>
            </div>
            <div className="informations-route">
              <p className="objective-visit">Limpeza Completa</p>
              <p className="client-address">Av. Novaes, 39B</p>
            </div>
          </div>
        </div>
      </div>

    </>

  );
}
