import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface SpectrumPoint {
  omega: number;
  re: number;
}

interface SpectrumChartProps {
  data: SpectrumPoint[];
  xDomain?: [number, number];
}

export function SpectrumChart({ data, xDomain }: SpectrumChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.5} />
          <XAxis
            dataKey="omega"
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            tickFormatter={(v) => Number(v).toFixed(2)}
            domain={xDomain}
            label={{
              value: 'ω (rad/s)',
              position: 'insideBottom',
              offset: -5,
              fill: '#71717a',
            }}
          />
          <YAxis
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            label={{
              value: 'X(jω)',
              angle: -90,
              position: 'insideLeft',
              fill: '#71717a',
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#a1a1aa' }}
            formatter={(value: number, name: string) => [Number(value).toFixed(6), name]}
            labelFormatter={(omega) => `ω = ${Number(omega).toFixed(4)} rad/s`}
          />
          <ReferenceLine x={0} stroke="#71717a" strokeDasharray="3 3" />
          <ReferenceLine y={0} stroke="#52525b" strokeDasharray="2 2" />
          <Line
            type="monotone"
            dataKey="re"
            name="X(jω)"
            stroke="#f472b6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
