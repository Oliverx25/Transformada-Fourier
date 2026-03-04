import React, { useMemo, useState } from 'react';
import {
  sampleSignal,
  computeSpectrum,
  effectiveSampleRate,
  type SignalFunction,
} from './lib/fft';
import { createCustomSignal } from './lib/customExpression';
import {
  SIGNAL_OPTIONS,
  CUSTOM_LABEL,
  type SignalId,
} from './lib/signals';
import { TimeChart } from './components/TimeChart';
import { SpectrumChart } from './components/SpectrumChart';

const T = 1;
const T_MIN = -2;
const T_MAX = 2;
const FFT_SIZE = 512;
const DEFAULT_CUSTOM_EXPRESSION = 'sin(2*pi*t)';

type TimePoint = { t: number; value: number };
type SpectrumPoint = { frequency: number; magnitude: number };
type ComputationResult = {
  timeData: TimePoint[];
  spectrumData: SpectrumPoint[];
  isValid: boolean;
  error: string | null;
};

function App(): React.ReactElement {
  const [signalId, setSignalId] = useState<SignalId>('sine');
  const [customExpression, setCustomExpression] =
    useState(DEFAULT_CUSTOM_EXPRESSION);

  const signalFn = useMemo((): SignalFunction | null => {
    if (signalId === 'custom') {
      return createCustomSignal(customExpression, T);
    }
    const id = signalId as Exclude<SignalId, 'custom'>;
    return SIGNAL_OPTIONS[id].fn;
  }, [signalId, customExpression]);

  const { timeData, spectrumData, isValid, error } = useMemo((): ComputationResult => {
    if (!signalFn) {
      return {
        timeData: [],
        spectrumData: [],
        isValid: false,
        error: 'Expresión inválida. Usa la variable t (ej: sin(2*pi*t))',
      };
    }

    const samples = sampleSignal(signalFn, T_MIN, T_MAX, FFT_SIZE);
    const Fs = effectiveSampleRate(T_MIN, T_MAX, FFT_SIZE);
    const spectrum = computeSpectrum(samples, Fs);

    const timeData: TimePoint[] = [];
    const step = (T_MAX - T_MIN) / (FFT_SIZE - 1);
    for (let i = 0; i < FFT_SIZE; i++) {
      const t = T_MIN + i * step;
      timeData.push({ t, value: samples[i] });
    }

    return {
      timeData,
      spectrumData: spectrum,
      isValid: true,
      error: null,
    };
  }, [signalFn]);

  return (
    <div className="min-h-screen bg-[#0f0f12] text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-amber-400 sm:text-3xl">
            Transformada de Fourier
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Espectro de frecuencia — Señal en tiempo y magnitud en frecuencia
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="mb-4 font-display text-lg font-medium text-zinc-200">
              Parámetros
            </h2>
            <div className="flex flex-wrap gap-6">
              <div>
                <label
                  htmlFor="signal"
                  className="mb-2 block text-sm font-medium text-zinc-400"
                >
                  Señal
                </label>
                <select
                  id="signal"
                  value={signalId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSignalId(e.target.value as SignalId)
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 font-display text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {(Object.entries(SIGNAL_OPTIONS) as [SignalId, { label: string }][]).map(
                    ([id, { label }]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    )
                  )}
                  <option value="custom">{CUSTOM_LABEL}</option>
                </select>
              </div>
              {signalId === 'custom' && (
                <div className="min-w-[240px] flex-1">
                  <label
                    htmlFor="customExpr"
                    className="mb-2 block text-sm font-medium text-zinc-400"
                  >
                    Expresión f(t)
                  </label>
                  <input
                    id="customExpr"
                    type="text"
                    value={customExpression}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCustomExpression(e.target.value)
                    }
                    placeholder="sin(2*pi*t)"
                    className={`w-full rounded-lg border px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-1 ${
                      isValid
                        ? 'border-zinc-700 bg-zinc-800/80 text-zinc-100 focus:border-amber-500 focus:ring-amber-500'
                        : 'border-red-500/60 bg-zinc-800/80 text-zinc-100 focus:border-red-500 focus:ring-red-500'
                    }`}
                  />
                  {!isValid && error && (
                    <p className="mt-1.5 text-xs text-red-400">{error}</p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">
                    Variable: t · Ej: sin(2*pi*t), cos(4*pi*t)
                  </p>
                </div>
              )}
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Ventana: [{T_MIN}, {T_MAX}] s · {FFT_SIZE} muestras (DFT directa)
            </p>
          </section>

          <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="mb-4 font-display text-lg font-medium text-zinc-200">
              Señal en el tiempo
            </h2>
            {timeData.length > 0 ? (
              <TimeChart
                data={timeData}
                yDomain={signalId === 'custom' ? 'auto' : undefined}
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center rounded-lg bg-zinc-800/30 text-zinc-500">
                Ingresa una expresión válida para ver la señal
              </div>
            )}
          </section>

          <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="mb-4 font-display text-lg font-medium text-zinc-200">
              Espectro de frecuencia
            </h2>
            <p className="mb-4 text-sm text-zinc-400">
              Magnitud |X(f)| vs frecuencia f (Hz)
            </p>
            {spectrumData.length > 0 ? (
              <SpectrumChart data={spectrumData} />
            ) : (
              <div className="flex h-[320px] items-center justify-center rounded-lg bg-zinc-800/30 text-zinc-500">
                El espectro se mostrará cuando la señal sea válida
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-12 border-t border-zinc-800/60 py-6 text-center text-sm text-zinc-500">
        Transformada de Fourier · Espectro de frecuencia
      </footer>
    </div>
  );
}

export default App;
