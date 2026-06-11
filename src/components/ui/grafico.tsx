import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Representa dados de receita semanal
 */
interface WeeklyRevenue {
  name: string;
  receita: number;
}

/**
 * Props do componente Grafico
 */
interface GraficoProps {
  /** Dados a serem exibidos no gráfico */
  data?: WeeklyRevenue[];
  /** Altura do gráfico em pixels */
  height?: number;
}

/**
 * Dados padrão de receita semanal
 */
const DEFAULT_DATA: WeeklyRevenue[] = [
  { name: "SEMANA 1", receita: 1000 },
  { name: "SEMANA 2", receita: 150 },
  { name: "SEMANA 3", receita: 1000 },
  { name: "SEMANA 4", receita: 150 },
];

/**
 * Componente Grafico
 *
 * Renderiza um gráfico de área responsivo utilizando Recharts.
 * - Bordas esquerda e inferior simulam eixos cartesianos
 * - Fundo levemente cinzento para destacar a curva
 * - Gradiente suave no preenchimento da área
 * - Interpolação cúbica para curva natural
 *
 * @example
 * <Grafico />
 *
 * @example
 * <Grafico data={customData} height={400} />
 */
const Grafico: React.FC<GraficoProps> = ({
  data = DEFAULT_DATA,
  height = 300,
}) => {
  return (
    <div
      className="flex flex-col flex-1 rounded-xl bg-slate-50 p-5 pt-4"
      style={{ height: `${height}px` }}
    >
      {/* Border left e bottom para simular eixos cartesianos */}
      <div className="relative flex-1 border-l-2 border-b-2 border-slate-300">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            {/* Gradiente linear do azul para transparência */}
            <defs>
              <linearGradient
                id="colorReceita"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#0b5ed7" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0b5ed7" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            {/* Eixo X - exibe os rótulos das semanas */}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              padding={{ left: 20, right: 20 }}
              tick={{
                fill: "#94a3b8",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "-0.05em",
              }}
              tickFormatter={(value) => value.toUpperCase()}
            />

            {/* Eixo Y - oculto (valores inferíveis pela altura da área) */}
            <YAxis hide />

            {/* Tooltip ao passar o mouse */}
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              labelStyle={{ color: "#f1f5f9" }}
            />

            {/* Área do gráfico com curva suave */}
            <Area
              type="natural"
              dataKey="receita"
              stroke="#0b5ed7"
              strokeWidth={2.5}
              fill="url(#colorReceita)"
              dot={{
                r: 4,
                strokeWidth: 2,
                fill: "#0b5ed7",
                stroke: "#fff",
              }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Grafico;