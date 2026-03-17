/**
 * Transformada de Fourier en Tiempo Continuo (CTFT) para señales periódicas.
 *
 * Para una señal periódica x(t) de periodo T, su Serie de Fourier compleja es:
 *   x(t) = Σ_{k=-∞}^{∞} a_k e^{jkω0 t},  ω0 = 2π/T
 * con
 *   a_k = (1/T) ∫_{-T/2}^{T/2} x(t) e^{-jkω0 t} dt
 *
 * Y su CTFT (en el sentido de distribuciones) es un espectro de líneas:
 *   X(ω) = 2π Σ_{k=-∞}^{∞} a_k δ(ω - kω0)
 *
 * Para visualización, graficamos los "pesos" de cada línea: |2π a_k|.
 */

export type SignalFunction = (t: number) => number;

type Complex = { re: number; im: number };

function simpsonIntegral(f: (t: number) => number, a: number, b: number, n = 2000): number {
  const N = n % 2 === 0 ? n : n + 1; // Simpson requiere n par
  const h = (b - a) / N;
  let sum = f(a) + f(b);
  for (let i = 1; i < N; i++) {
    const x = a + i * h;
    sum += i % 2 === 0 ? 2 * f(x) : 4 * f(x);
  }
  return (h / 3) * sum;
}

export interface FourierLine {
  k: number;
  omega: number;
  /** Peso (magnitud) de la línea en CTFT: |2π a_k| */
  magnitude: number;
  /** Coeficiente complejo a_k */
  ak: Complex;
}

export function computeComplexFourierCoefficient(
  x: SignalFunction,
  T: number,
  k: number,
  integrationSteps = 2000
): Complex {
  const omega0 = (2 * Math.PI) / T;
  const a = -T / 2;
  const b = T / 2;

  const re = (1 / T) * simpsonIntegral((t) => x(t) * Math.cos(k * omega0 * t), a, b, integrationSteps);
  const im = -(1 / T) * simpsonIntegral((t) => x(t) * Math.sin(k * omega0 * t), a, b, integrationSteps);

  return { re, im };
}

export function computeCTFTLineSpectrum(
  x: SignalFunction,
  T: number,
  maxHarmonic: number,
  integrationSteps = 2000
): FourierLine[] {
  const omega0 = (2 * Math.PI) / T;
  const lines: FourierLine[] = [];

  for (let k = -maxHarmonic; k <= maxHarmonic; k++) {
    const ak = computeComplexFourierCoefficient(x, T, k, integrationSteps);
    const magnitude = 2 * Math.PI * Math.hypot(ak.re, ak.im);
    lines.push({
      k,
      omega: k * omega0,
      magnitude,
      ak,
    });
  }

  return lines.sort((a, b) => a.omega - b.omega);
}

