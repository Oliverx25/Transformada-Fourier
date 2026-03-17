import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface SpectrumPoint {
  omega: number;
  magnitude: number;
  k: number;
  akRe: number;
  akIm: number;
}

interface SpectrumChartProps {
  data: SpectrumPoint[];
}

export function SpectrumChart({ data }: SpectrumChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {/* “Stems” (espectro de líneas) con barras delgadas + puntos arriba */}
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.5} />
          <XAxis
            dataKey="omega"
            stroke="#71717a"
            tick={{ fill: '#a1a1aa', fontSize: 12 }}
            tickFormatter={(v) => Number(v).toFixed(2)}
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
              value: '|2π·aₖ|',
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
            formatter={(value: number, name: string, item: any) => {
              const payload = item?.payload as SpectrumPoint | undefined;
              if (!payload) return [Number(value).toFixed(6), name];
              const re = payload.akRe;
              const im = payload.akIm;
              return [
                `${Number(value).toFixed(6)}  (aₖ = ${re.toFixed(6)} ${im >= 0 ? '+' : '-'} j${Math.abs(im).toFixed(6)})`,
                '|2π·aₖ|',
              ];
            }}
            labelFormatter={(omega) => `ω = ${Number(omega).toFixed(4)} rad/s`}
          />
          <ReferenceLine x={0} stroke="#71717a" strokeDasharray="3 3" />
          <ReferenceLine y={0} stroke="#52525b" strokeDasharray="2 2" />
          <Bar
            dataKey="magnitude"
            name="Espectro (líneas)"
            fill="#f472b6"
            barSize={2}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
