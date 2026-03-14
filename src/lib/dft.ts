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
 * Convierte índice de bin k en frecuencia en Hz (espectro dos lados).
 * k = 0..N/2 -> f = 0..Fs/2; k = N/2+1..N-1 -> f = -Fs/2+Δf..-Δf
 */
function binToFrequencyTwoSided(k: number, N: number, Fs: number): number {
  if (k <= N / 2) return (k * Fs) / N;
  return ((k - N) * Fs) / N;
}

/**
 * Espectro de magnitud de la DFT como función en el dominio de la frecuencia.
 * Dos lados: f desde -Fs/2 hasta Fs/2, ordenado por f.
 * Escalado: |X[k]|/N (convención dos lados para señal real).
 * No usa FFT; usa DFT directa O(N²).
 *
 * @param samples - Muestras en tiempo (cualquier longitud N)
 * @param sampleRate - Frecuencia de muestreo Fs (muestras/segundo)
 */
export function computeDFTSpectrumTwoSided(
  samples: number[],
  sampleRate: number
): { frequency: number; magnitude: number }[] {
  const N = samples.length;
  if (N === 0) return [];

  const X = dftDirect(samples);
  const Fs = sampleRate;
  const result: { frequency: number; magnitude: number }[] = [];

  for (let k = 0; k < N; k++) {
    const re = X[k][0];
    const im = X[k][1];
    const magnitude = Math.sqrt(re * re + im * im) / N;
    const frequency = binToFrequencyTwoSided(k, N, Fs);
    result.push({ frequency, magnitude });
  }

  result.sort((a, b) => a.frequency - b.frequency);
  return result;
}

/**
 * Dado un intervalo de tiempo [tMin, tMax] y número de muestras N,
 * devuelve la frecuencia de muestreo efectiva
 */
export function effectiveSampleRate(tMin: number, tMax: number, N: number): number {
  return N <= 1 ? 1 : (N - 1) / (tMax - tMin);
}
