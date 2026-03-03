/**
 * Transformada de Fourier discreta (DFT) y espectro de frecuencia
 *
 * Para señales reales: X[k] = Σ x[n] e^{-j2πkn/N}
 * Espectro de magnitud: |X[k]| para k = 0..N/2 (frecuencias positivas)
 */

/** Número complejo [real, imaginario] */
type Complex = [number, number];

/**
 * FFT radix-2 (Cooley-Tukey) in-place
 * Tamaño N debe ser potencia de 2
 */
function fftRadix2(x: Complex[]): void {
  const N = x.length;
  if (N <= 1) return;

  const even: Complex[] = [];
  const odd: Complex[] = [];
  for (let i = 0; i < N; i++) {
    if (i % 2 === 0) even.push(x[i]);
    else odd.push(x[i]);
  }

  fftRadix2(even);
  fftRadix2(odd);

  for (let k = 0; k < N / 2; k++) {
    const angle = (-2 * Math.PI * k) / N;
    const t: Complex = [
      Math.cos(angle) * odd[k][0] - Math.sin(angle) * odd[k][1],
      Math.cos(angle) * odd[k][1] + Math.sin(angle) * odd[k][0],
    ];
    x[k] = [even[k][0] + t[0], even[k][1] + t[1]];
    x[k + N / 2] = [even[k][0] - t[0], even[k][1] - t[1]];
  }
}

/** Redondea N a la siguiente potencia de 2 */
function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

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
  const step = (tMax - tMin) / (N - 1);
  for (let i = 0; i < N; i++) {
    const t = tMin + i * step;
    out.push(f(t));
  }
  return out;
}

/**
 * Calcula la transformada de Fourier (DFT vía FFT) y devuelve el espectro de magnitud
 * para frecuencias positivas (0 a Fs/2).
 *
 * @param samples - Muestras en tiempo (se rellenan con ceros hasta potencia de 2 si hace falta)
 * @param sampleRate - Frecuencia de muestreo Fs (muestras/segundo)
 */
export function computeSpectrum(
  samples: number[],
  sampleRate: number
): { frequency: number; magnitude: number }[] {
  const N = nextPowerOf2(samples.length);
  const padded = samples.slice(0, N);
  while (padded.length < N) padded.push(0);

  const complex: Complex[] = padded.map((x) => [x, 0]);
  fftRadix2(complex);

  const Fs = sampleRate;
  const result: { frequency: number; magnitude: number }[] = [];

  for (let k = 0; k <= N / 2; k++) {
    const re = complex[k][0];
    const im = complex[k][1];
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
  return (N - 1) / (tMax - tMin);
}
