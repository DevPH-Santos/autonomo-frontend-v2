import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeeklyRevenue {
  name: string;
  receita: number;
}

interface GraficoProps {
  data?: WeeklyRevenue[];
  height?: number;
}

const DEFAULT_DATA: WeeklyRevenue[] = [
  { name: "SEMANA 1", receita: 1000 },
  { name: "SEMANA 2", receita: 150 },
  { name: "SEMANA 3", receita: 1000 },
  { name: "SEMANA 4", receita: 150 },
];

const Grafico: React.FC<GraficoProps> = ({
  data = DEFAULT_DATA,
  height = 300,
}) => {
  return (
    <div
      className="relative rounded-xl bg-slate-50 p-5 pt-4 border-l-2 border-b-2 border-slate-300"
      style={{ height: `${height}px` }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
        >
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

          <YAxis hide />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
            labelStyle={{ color: "#f1f5f9" }}
          />

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
  );
};

export default Grafico;