/**
 * Transformada de Fourier discreta (DFT) por el método directo
 *
 * X[k] = Σ_{n=0}^{N-1} x[n] e^{-j2πkn/N}
 * Espectro de magnitud: |X[k]| para k = 0..N/2 (frecuencias positivas)
 */

/** Número complejo [real, imaginario] */
type Complex = [number, number];

export type SignalFunction = (t: number) => number;

/**
 * Muestrea la señal f(t) en el intervalo [tMin, tMax] con N puntos
 */
export function sampleSignal(
  f: SignalFunction,
  tMin: number,
  tMax: number,
  N: number
): number[] {
  const out: number[] = [];
  const step = (N === 1) ? 0 : (tMax - tMin) / (N - 1);
  for (let i = 0; i < N; i++) {
    const t = tMin + i * step;
    out.push(f(t));
  }
  return out;
}

/**
 * DFT directa (método básico): X[k] = Σ_n x[n] e^{-j2πkn/N}
 * Para cada k calcula la suma sobre n. Complejidad O(N²).
 */
function dftDirect(x: number[]): Complex[] {
  const N = x.length;
  const X: Complex[] = [];

  for (let k = 0; k < N; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (-2 * Math.PI * k * n) / N;
      re += x[n] * Math.cos(angle);
      im += x[n] * Math.sin(angle);
    }
    X.push([re, im]);
  }

  return X;
}

/**
 * Calcula el espectro de magnitud mediante DFT directa.
 * Devuelve frecuencias positivas 0 a Fs/2.
 *
 * @param samples - Muestras en tiempo (cualquier longitud N)
 * @param sampleRate - Frecuencia de muestreo Fs (muestras/segundo)
 */
export function computeSpectrum(
  samples: number[],
  sampleRate: number
): { frequency: number; magnitude: number }[] {
  const N = samples.length;
  if (N === 0) return [];

  const X = dftDirect(samples);
  const Fs = sampleRate;
  const result: { frequency: number; magnitude: number }[] = [];

  const half = Math.floor(N / 2);
  for (let k = 0; k <= half; k++) {
    const re = X[k][0];
    const im = X[k][1];
    const magnitude = (2 / N) * Math.sqrt(re * re + im * im);
    const frequency = (k * Fs) / N;
    result.push({ frequency, magnitude });
  }

  return result;
}

/**
 * Dado un intervalo de tiempo [tMin, tMax] y número de muestras N,
 * devuelve la frecuencia de muestreo efectiva
 */
export function effectiveSampleRate(tMin: number, tMax: number, N: number): number {
  return N <= 1 ? 1 : (N - 1) / (tMax - tMin);
}
