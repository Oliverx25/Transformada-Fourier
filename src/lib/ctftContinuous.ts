/**
 * CTFT (Transformada de Fourier en tiempo continuo) por integración numérica.
 *
 * Definición:
 *   X(jω) = ∫_{-∞}^{∞} x(t) e^{-jωt} dt
 *
 * Para una app interactiva, aproximamos la integral integrando en una ventana finita
 * [tMin, tMax] (la misma que se usa para visualizar x(t)):
 *   X(jω) ≈ ∫_{tMin}^{tMax} x(t) e^{-jωt} dt
 *
 * Implementación: muestreo uniforme en t + regla del trapecio (O(Nt·Nω)).
 */

export type SignalFunction = (t: number) => number;

export interface CtftPoint {
  omega: number;
  re: number;
  im: number;
}

export interface CtftOptions {
  tMin: number;
  tMax: number;
  timeSamples: number;
  omegaMin: number;
  omegaMax: number;
  omegaSamples: number;
}

function linspace(min: number, max: number, n: number): number[] {
  if (n <= 1) return [min];
  const step = (max - min) / (n - 1);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(min + i * step);
  return out;
}

/**
 * Calcula X(jω) para ω en una malla uniforme.
 * Nota: devuelve la convención con e^{-jωt}.
 */
export function computeCtftNumerical(
  x: SignalFunction,
  opts: CtftOptions
): { points: CtftPoint[]; tGrid: number[]; xGrid: number[] } {
  const tGrid = linspace(opts.tMin, opts.tMax, opts.timeSamples);
  const xGrid = tGrid.map((t) => x(t));

  const dt =
    tGrid.length <= 1 ? 0 : (opts.tMax - opts.tMin) / (opts.timeSamples - 1);

  const omegaGrid = linspace(opts.omegaMin, opts.omegaMax, opts.omegaSamples);

  const points: CtftPoint[] = omegaGrid.map((omega) => {
    let re = 0;
    let im = 0;

    // Trapecio: peso 1/2 en extremos
    for (let n = 0; n < tGrid.length; n++) {
      const weight = n === 0 || n === tGrid.length - 1 ? 0.5 : 1;
      const t = tGrid[n];
      const xVal = xGrid[n];
      const c = Math.cos(omega * t);
      const s = Math.sin(omega * t);
      // e^{-jωt} = cos(ωt) - j sin(ωt)
      re += weight * xVal * c;
      im -= weight * xVal * s;
    }

    return { omega, re: re * dt, im: im * dt };
  });

  return { points, tGrid, xGrid };
}

