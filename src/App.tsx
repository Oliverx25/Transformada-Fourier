import React, { useEffect, useMemo, useState } from 'react';
import {
  sampleSignal,
  type SignalFunction,
} from './lib/dft';
import { computeCtftNumerical, type CtftPoint } from './lib/ctftContinuous';
import { createCustomSignal } from './lib/customExpression';
import {
  SIGNAL_OPTIONS,
  CUSTOM_LABEL,
  type SignalId,
} from './lib/signals';
import { TimeChart } from './components/TimeChart';
import { SpectrumChart } from './components/SpectrumChart';

const T_MIN = -2;
const T_MAX = 2;
const TIME_SAMPLES = 512;
const OMEGA_SAMPLES = 801;
const DEFAULT_CUSTOM_EXPRESSION = 'sin(2*pi*t)';

type TimePoint = { t: number; value: number };
type SpectrumPoint = {
  omega: number;
  re: number;
};
type ComputationResult = {
  timeData: TimePoint[];
  spectrumData: SpectrumPoint[];
  mathText: string;
  omegaMax: number;
  isValid: boolean;
  error: string | null;
};

function formatMathBlock(title: string, lines: string[]): string {
  return [title, ...lines].join('\n');
}

function buildMathText(params: {
  signalId: SignalId;
  label: string;
  customExpression: string;
  timeText?: string;
  ctftText?: string;
}): string {
  const { signalId, label, customExpression, timeText, ctftText } = params;
  const header = `Señal seleccionada: ${label}`;

  const general = formatMathBlock('Definición (CTFT):', [
    'X(jω) = ∫_{-∞}^{∞} x(t) e^{-jωt} dt',
    `En la app se aproxima en la ventana: ∫_{${T_MIN}}^{${T_MAX}} x(t) e^{-jωt} dt`,
  ]);

  const signalFormula =
    signalId === 'custom'
      ? formatMathBlock('x(t):', [`x(t) = ${customExpression}`])
      : formatMathBlock('x(t):', [timeText ?? 'x(t) definida por la opción seleccionada']);

  const ctftResult =
    signalId === 'custom'
      ? formatMathBlock('Resultado:', [
          'Para expresión personalizada se muestra la definición; el resultado analítico depende de la función.',
        ])
      : formatMathBlock('Resultado:', [ctftText ?? 'X(jω) según la señal seleccionada.']);

  return [header, '', signalFormula, '', general, '', ctftResult].join('\n');
}

function App(): React.ReactElement {
  const [signalId, setSignalId] = useState<SignalId>('rect');
  const [customExpression, setCustomExpression] =
    useState(DEFAULT_CUSTOM_EXPRESSION);
  const [omegaZoom, setOmegaZoom] = useState<number | null>(null);

  const signalFn = useMemo((): SignalFunction | null => {
    if (signalId === 'custom') {
      return createCustomSignal(customExpression, 0);
    }
    const id = signalId as Exclude<SignalId, 'custom'>;
    const selected = SIGNAL_OPTIONS[id];
    return selected?.fn ?? null;
  }, [signalId, customExpression]);

  const { timeData, spectrumData, mathText, omegaMax, isValid, error } = useMemo((): ComputationResult => {
    if (!signalFn) {
      return {
        timeData: [],
        spectrumData: [],
        mathText: '',
        isValid: false,
        error: 'Expresión inválida. Usa la variable t (ej: sin(2*pi*t))',
      };
    }

    const samples = sampleSignal(signalFn, T_MIN, T_MAX, TIME_SAMPLES);
    const windowLength = T_MAX - T_MIN;
    const omegaMax = Math.max(8 * Math.PI, (20 * Math.PI) / windowLength * 10); // heurística estable
    const { points } = computeCtftNumerical(signalFn, {
      tMin: T_MIN,
      tMax: T_MAX,
      timeSamples: TIME_SAMPLES,
      omegaMin: -omegaMax,
      omegaMax,
      omegaSamples: OMEGA_SAMPLES,
    });

    const spectrumData: SpectrumPoint[] = points.map((p: CtftPoint) => ({
      omega: p.omega,
      re: p.re,
    }));

    const timeData: TimePoint[] = [];
    const step = (T_MAX - T_MIN) / (TIME_SAMPLES - 1);
    for (let i = 0; i < TIME_SAMPLES; i++) {
      const t = T_MIN + i * step;
      timeData.push({ t, value: samples[i] });
    }

    const meta =
      signalId === 'custom'
        ? { label: CUSTOM_LABEL, timeText: `x(t) = ${customExpression}`, ctftText: undefined }
        : SIGNAL_OPTIONS[signalId as Exclude<SignalId, 'custom'>];
    const mathText = buildMathText({
      signalId,
      label: meta.label,
      customExpression,
      timeText: signalId === 'custom' ? meta.timeText : meta.timeText,
      ctftText: meta.ctftText,
    });

    return {
      timeData,
      spectrumData,
      mathText,
      omegaMax,
      isValid: true,
      error: null,
    };
  }, [signalFn, signalId, customExpression]);

  useEffect(() => {
    if (!Number.isFinite(omegaMax) || omegaMax <= 0) {
      setOmegaZoom(null);
      return;
    }
    // Valor inicial: ventana centrada más pequeña para ver mejor la forma
    setOmegaZoom((prev) => (prev === null ? omegaMax / 4 : Math.min(prev, omegaMax)));
  }, [omegaMax]);

  return (
    <div className="min-h-screen bg-[#0f0f12] text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-amber-400 sm:text-3xl">
              Transformada de Fourier
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Espectro de frecuencia — Señal en tiempo y magnitud en frecuencia
            </p>
          </div>
          <a
            href="https://github.com/Oliverx25/Transformada-Fourier"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800/80 hover:text-white"
            aria-label="Ver repositorio en GitHub"
          >
            <svg className="h-7 w-7 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
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
                  {(
                    Object.entries(SIGNAL_OPTIONS) as Array<
                      [Exclude<SignalId, 'custom'>, (typeof SIGNAL_OPTIONS)[Exclude<SignalId, 'custom'>]]
                    >
                  ).map(([id, meta]) => (
                    <option key={id} value={id}>
                      {meta.label}
                    </option>
                  ))}
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
              Tiempo: [{T_MIN}, {T_MAX}] s · {TIME_SAMPLES} muestras · CTFT numérica (trapecio) · ω con {OMEGA_SAMPLES} puntos
            </p>
          </section>

          <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
            <h2 className="mb-4 font-display text-lg font-medium text-zinc-200">
              Resultado matemático (CTFT)
            </h2>
            <p className="mb-4 text-sm text-zinc-400">
              Se muestra la definición de la CTFT y la forma esperada de \(X(j\omega)\) para la señal seleccionada.
            </p>
            <pre className="max-h-[340px] overflow-auto rounded-lg border border-zinc-800/70 bg-zinc-950/40 p-4 font-mono text-xs leading-relaxed text-zinc-200">
              {isValid ? (mathText || 'Sin datos') : (error ?? 'Señal inválida')}
            </pre>
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
              CTFT continua: se grafica X(jω) (parte real) como función continua de ω (rad/s), como en el ejemplo del pulso.
            </p>
            {spectrumData.length > 0 ? (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                  <span className="font-medium text-zinc-300">Zoom en ω:</span>
                  <input
                    type="range"
                    min={omegaMax * 0.05}
                    max={omegaMax}
                    step={omegaMax / 200}
                    value={omegaZoom ?? omegaMax}
                    onChange={(e) => setOmegaZoom(Number(e.target.value))}
                    className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-zinc-700 accent-amber-400"
                  />
                  <span>
                    Ventana: [−
                    {(omegaZoom ?? omegaMax).toFixed(2)}, {(omegaZoom ?? omegaMax).toFixed(2)}] rad/s
                  </span>
                  <button
                    type="button"
                    onClick={() => setOmegaZoom(omegaMax / 4)}
                    className="rounded-md border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-200 hover:border-amber-500 hover:text-amber-300"
                  >
                    Centrar cerca de 0
                  </button>
                  <button
                    type="button"
                    onClick={() => setOmegaZoom(omegaMax)}
                    className="rounded-md border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-200 hover:border-amber-500 hover:text-amber-300"
                  >
                    Ver todo
                  </button>
                </div>
                <SpectrumChart
                  data={spectrumData}
                  xDomain={
                    omegaZoom && omegaZoom > 0 ? ([-omegaZoom, omegaZoom] as [number, number]) : undefined
                  }
                />
              </>
            ) : (
              <div className="flex h-[320px] items-center justify-center rounded-lg bg-zinc-800/30 text-zinc-500">
                El espectro se mostrará cuando la señal sea válida
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-12 border-t border-zinc-800/60 py-6 text-center text-sm text-zinc-500">
        Transformada de Fourier (Tiempo continuo) · CTFT continua
      </footer>
    </div>
  );
}

export default App;
