import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GraficoData {
  name: string;
  receita: number;
}

interface GraficoProps {
  data?: GraficoData[];
  height?: number;
}

const DEFAULT_DATA: GraficoData[] = [
  { name: "SEMANA 1", receita: 1000 },
  { name: "SEMANA 2", receita: 150 },
  { name: "SEMANA 3", receita: 1000 },
  { name: "SEMANA 4", receita: 150 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

    return (
      <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900">
          {payload[0].payload.name}
        </p>
        <p className="text-base font-bold text-blue-600 mt-1">{formatted}</p>
      </div>
    );
  }
  return null;
};

const Grafico: React.FC<GraficoProps> = ({
  data = DEFAULT_DATA,
  height = 300,
}) => {
  return (
    <div
      className="relative rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 border border-gray-200 shadow-sm overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={height}
      >
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient
              id="colorReceita"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#0b5ed7" stopOpacity={0.35} />
              <stop offset="50%" stopColor="#0b5ed7" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#0b5ed7" stopOpacity={0.02} />
            </linearGradient>

            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="2"
                floodOpacity="0.1"
              />
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
            style={{ opacity: 0.5 }}
          />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            padding={{ left: 10, right: 10 }}
            tick={{
              fill: "#64748b",
              fontSize: 12,
              fontWeight: 600,
            }}
            tickFormatter={(value) => String(value).toUpperCase()}
          />

          <YAxis hide domain={[0, "dataMax + 1000"]} />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "#0b5ed7",
              strokeWidth: 1,
              opacity: 0.3,
            }}
          />

          <Area
            type="monotone"
            dataKey="receita"
            stroke="#0b5ed7"
            strokeWidth={3}
            fill="url(#colorReceita)"
            dot={{
              r: 5,
              fill: "#0b5ed7",
              stroke: "#fff",
              strokeWidth: 2.5,
            }}
            activeDot={{
              r: 7,
              fill: "#0b5ed7",
              stroke: "#fff",
              strokeWidth: 2.5,
              filter: "url(#shadow)",
            }}
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Grafico;
