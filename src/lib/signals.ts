/**
 * Señales predefinidas para la Transformada de Fourier
 *
 * Catálogo:
 * - Señales periódicas (idénticas a Serie-Trigo-Fourier)
 * - Señales aperiódicas (soporte finito / ventaneadas) para visualizar CTFT continua
 */

import type { SignalFunction } from './fourier';

/** Normaliza t al intervalo [0, 1) dentro del período T */
function normalizePhase(t: number, T: number): number {
  return ((t / T + 0.5) % 1 + 1) % 1;
}

/** Onda cuadrada: +1 en [0, T/2), -1 en [-T/2, 0) — convención estándar (50 % duty cycle). */
export const squareWave: SignalFunction = (t) => {
  const T = 1;
  const phase = normalizePhase(t, T);
  return phase < 0.5 ? -1 : 1;
};

/** Diente de sierra: rampa de -1 a 1 en un período */
export const sawtoothWave: SignalFunction = (t) => {
  const T = 1;
  const phase = normalizePhase(t, T);
  return 2 * phase - 1;
};

/** Onda triangular */
export const triangleWave: SignalFunction = (t) => {
  const T = 1;
  const phase = normalizePhase(t, T);
  return 4 * Math.abs(phase - 0.5) - 1;
};

/** Onda sinusoidal */
export const sineWave: SignalFunction = (t) => {
  const T = 1;
  return Math.sin((2 * Math.PI * t) / T);
};

/** Pulso rectangular periódico con duty cycle d (0-1) */
export const createRectangularPulse = (dutyCycle: number): SignalFunction => {
  const d = Math.max(0.01, Math.min(0.99, dutyCycle));
  return (t) => {
    const T = 1;
    const phase = normalizePhase(t, T);
    return phase < d ? 1 : 0;
  };
};

function rect(t: number, halfWidth: number): number {
  return Math.abs(t) <= halfWidth ? 1 : 0;
}

export const rectangularPulse: SignalFunction = (t) => {
  const T1 = 0.25; // medio-ancho del pulso
  return rect(t, T1);
};

export const windowedSine: SignalFunction = (t) => {
  const T1 = 0.5;
  const f0 = 1; // Hz (solo para la forma en el tiempo; CTFT se hace en ω)
  return rect(t, T1) * Math.sin(2 * Math.PI * f0 * t);
};

export const triangularPulse: SignalFunction = (t) => {
  const T1 = 0.5;
  if (Math.abs(t) > T1) return 0;
  return 1 - Math.abs(t) / T1;
};

export const exponentialDecay: SignalFunction = (t) => {
  // x(t) = e^{-a t} u(t)
  const a = 2;
  return t >= 0 ? Math.exp(-a * t) : 0;
};

export type SignalId =
  // Señales periódicas (anteriores)
  | 'square'
  | 'sawtooth'
  | 'triangle'
  | 'sine'
  | 'rectPeriodic'
  // Señales aperiódicas
  | 'rect'
  | 'tri'
  | 'exp'
  | 'winSine'
  | 'custom';

export const SIGNAL_OPTIONS: Record<
  Exclude<SignalId, 'custom'>,
  { label: string; fn: SignalFunction; timeText: string; ctftText: string }
> = {
  // Señales periódicas (anteriores)
  square: {
    label: 'Onda cuadrada (periódica)',
    fn: squareWave,
    timeText: 'x(t) = ±1 (periódica, T=1)',
    ctftText: 'Idealmente: espectro discreto (líneas). En la app (ventana finita) se ve un espectro continuo aproximado.',
  },
  sawtooth: {
    label: 'Diente de sierra (periódica)',
    fn: sawtoothWave,
    timeText: 'x(t) = rampa periódica en T=1',
    ctftText: 'Idealmente: espectro discreto (líneas). En la app se aproxima con una ventana finita.',
  },
  triangle: {
    label: 'Onda triangular (periódica)',
    fn: triangleWave,
    timeText: 'x(t) = triangular periódica en T=1',
    ctftText: 'Idealmente: espectro discreto (líneas). En la app se aproxima con una ventana finita.',
  },
  sine: {
    label: 'Sinusoidal (periódica)',
    fn: sineWave,
    timeText: 'x(t) = sin(2πt) (T=1)',
    ctftText: 'Idealmente: dos líneas en ±ω0. En la app (ventana finita) se observa ensanchamiento tipo sinc.',
  },
  rectPeriodic: {
    label: 'Pulso rectangular (periódico)',
    fn: createRectangularPulse(0.25),
    timeText: 'x(t) = pulso periódico con duty cycle d',
    ctftText: 'Idealmente: serie de Fourier (líneas). En la app se aproxima con ventana finita.',
  },

  // Señales aperiódicas
  rect: {
    label: 'Pulso rectangular (aperiódico)',
    fn: rectangularPulse,
    timeText: 'x(t) = 1, |t| ≤ T1; 0, |t| > T1',
    ctftText: 'X(jω) = ∫_{-T1}^{T1} e^{-jωt} dt = 2·sin(ωT1)/ω',
  },
  tri: {
    label: 'Pulso triangular (aperiódico)',
    fn: triangularPulse,
    timeText: 'x(t) = 1 − |t|/T1, |t| ≤ T1; 0 en otro caso',
    ctftText: 'X(jω) es real y proporcional a sinc² (forma típica)',
  },
  exp: {
    label: 'Exponencial decreciente (u(t))',
    fn: exponentialDecay,
    timeText: 'x(t) = e^{-a t} u(t)',
    ctftText: 'X(jω) = 1 / (a + jω)',
  },
  winSine: {
    label: 'Seno ventaneado (aperiódico)',
    fn: windowedSine,
    timeText: 'x(t) = rect(t/Tw)·sin(2πf0 t)',
    ctftText: 'CTFT continua (bandas laterales tipo sinc alrededor de ±ω0)',
  },
};

export const CUSTOM_LABEL = 'Expresión personalizada';
