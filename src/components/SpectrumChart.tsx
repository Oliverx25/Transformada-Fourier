import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SpectrumPoint {
  frequency: number;
  magnitude: number;
}

interface SpectrumChartProps {
  data: SpectrumPoint[];
}

export function SpectrumChart({ data }: SpectrumChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.5} />
          <XAxis
            dataKey="frequency"
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            tickFormatter={(v) => (v >= 1 ? v.toFixed(1) : v.toFixed(2))}
            label={{
              value: 'f (Hz)',
              position: 'insideBottom',
              offset: -5,
              fill: '#71717a',
            }}
          />
          <YAxis
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            label={{
              value: '|X(f)|',
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
            formatter={(value: number) => [value.toFixed(4), 'Magnitud']}
            labelFormatter={(f) => `f = ${Number(f).toFixed(3)} Hz`}
          />
          <Bar
            dataKey="magnitude"
            name="Espectro"
            fill="#f472b6"
            fillOpacity={0.85}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
