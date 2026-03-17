/**
 * Señales predefinidas para la Transformada de Fourier
 * En esta práctica buscamos visualizar la CTFT continua, por lo que se usan
 * señales aperiodicas o señales "ventaneadas" (soporte finito) para evitar
 * espectros de líneas (caso periódico ideal).
 */

import type { SignalFunction } from './fourier';

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
  | 'rect'
  | 'tri'
  | 'exp'
  | 'winSine'
  | 'custom';

export const SIGNAL_OPTIONS: Record<
  Exclude<SignalId, 'custom'>,
  { label: string; fn: SignalFunction; timeText: string; ctftText: string }
> = {
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
