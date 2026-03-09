# Transformada de Fourier

Aplicación web interactiva para visualizar el **espectro de frecuencia** de una señal en tiempo continuo: se muestrea la señal en una ventana finita, se calcula la **transformada de Fourier discreta (DFT)** por el método directo y se muestra la magnitud \(|X(f)|\) frente a la frecuencia \(f\) (Hz). Pensada como apoyo en la asignatura de **Procesamiento Digital de Señales (PDS)**.

---

## Definición matemática

### De tiempo continuo a muestras

Una señal continua \(f(t)\) se **muestrea** en \(N\) puntos equiespaciados en el intervalo \([t_{\min}, t_{\max}]\):
$$t_n = t_{\min} + n\,\frac{t_{\max} - t_{\min}}{N-1}, \qquad n = 0, 1, \ldots, N-1,$$
obteniendo la secuencia \(x[n] = f(t_n)\). La **frecuencia de muestreo efectiva** es
$$F_s = \frac{N-1}{t_{\max} - t_{\min}} \quad \text{(muestras por segundo)}.$$

### Transformada de Fourier discreta (DFT)

La DFT de la secuencia \(x[n]\) de longitud \(N\) se define como
$$X[k] = \sum_{n=0}^{N-1} x[n]\, e^{-j2\pi kn/N}, \qquad k = 0, 1, \ldots, N-1.$$
En forma cartesiana: \(e^{-j\theta} = \cos\theta - j\sin\theta\), de modo que
$$X[k] = \sum_{n=0}^{N-1} x[n]\cos\left(\frac{2\pi kn}{N}\right) - j\sum_{n=0}^{N-1} x[n]\sin\left(\frac{2\pi kn}{N}\right).$$
\(X[k]\) es complejo; su **magnitud** \(|X[k]| = \sqrt{\mathrm{Re}(X[k])^2 + \mathrm{Im}(X[k])^2}\) indica el contenido en la frecuencia asociada al índice \(k\).

### Relación índice–frecuencia

Para una DFT de \(N\) puntos y frecuencia de muestreo \(F_s\), la frecuencia en Hz correspondiente al índice \(k\) es
$$f_k = \frac{k\,F_s}{N}.$$
Los índices \(k = 0, 1, \ldots, \lfloor N/2 \rfloor\) cubren las frecuencias desde 0 hasta \(F_s/2\) (rango de Nyquist). El espectro de **magnitud unilateral** (solo frecuencias no negativas) se suele escalar con \((2/N)|X[k]|\) para \(k \geq 1\) y \((1/N)|X[0]|\) para la componente de continua, de modo que la altura de un pico espectral coincida con la amplitud de una sinusoide pura. En esta aplicación se usa \((2/N)|X[k]|\) para todos los \(k\) en el lado positivo y se refleja el espectro a frecuencias negativas para visualización didáctica (espectro bilateral centrado en \(f=0\)).

---

## Implementación

### Muestreo

La función `sampleSignal` en `src/lib/dft.ts` evalúa la señal \(f(t)\) en \(N\) instantes equiespaciados en \([t_{\min}, t_{\max}]\) y devuelve el array de muestras \(x[n]\). En la aplicación, \(t_{\min} = -2\), \(t_{\max} = 2\) y \(N = 512\) (constante `DFT_SIZE`).

### DFT directa

La función `dftDirect` implementa la suma
$$X[k] = \sum_{n=0}^{N-1} x[n]\left(\cos(2\pi kn/N) - j\sin(2\pi kn/N)\right)$$
para cada \(k = 0, \ldots, N-1\), almacenando cada \(X[k]\) como par `[real, imaginario]`. La complejidad es \(O(N^2)\). No se usa FFT en este proyecto para mantener la implementación explícita y didáctica.

### Espectro de magnitud

`computeSpectrum(samples, sampleRate)` obtiene \(X[k]\) con `dftDirect`, calcula \(F_s = \texttt{sampleRate}\) (vía `effectiveSampleRate(tMin, tMax, N)`), y para \(k = 0, \ldots, \lfloor N/2 \rfloor\) forma los puntos \((f_k, (2/N)|X[k]|)\) con \(f_k = k F_s/N\). El resultado es el espectro **unilateral** (solo frecuencias \(\geq 0\)). Para la gráfica se construye un espectro **bilateral** reflejando estos puntos a frecuencias negativas (función `toTwoSidedSpectrum` en `App.tsx`), de modo que se vea el espectro centrado en \(f = 0\).

### Señales

- **Predefinidas** (`src/lib/signals.ts`): onda cuadrada, diente de sierra, triangular, sinusoidal, pulso rectangular (periodo \(T=1\), extensión periódica).
- **Expresión personalizada** (`src/lib/customExpression.ts`): cadena evaluada con [mathjs](https://mathjs.org/) usando la variable `t` (ej: `sin(2*pi*t)`, `cos(4*pi*t)`). La ventana de análisis es \([t_{\min}, t_{\max}]\); la señal se evalúa solo en ese intervalo (sin extensión periódica implícita), por lo que el espectro corresponde a la porción de señal en esa ventana.

---

## Interfaz y uso

### Sección "Parámetros"

- **Señal**: selector entre presets o "Expresión personalizada". Si es personalizada, se muestra un campo de texto para \(f(t)\) (variable `t`).
- Se indica la **ventana** \([t_{\min}, t_{\max}]\) y el **número de muestras** \(N\) usadas en la DFT.

### Sección "Señal en el tiempo"

- Gráfica de la señal \(f(t)\) en el intervalo de análisis (muestras en tiempo). Dominio del eje Y fijo para presets o automático para expresión personalizada.

### Sección "Espectro de frecuencia"

- Gráfica de **magnitud \(|X(f)|\)** frente a **frecuencia \(f\) (Hz)**. El espectro se muestra de forma bilateral (frecuencias negativas y positivas) centrado en \(f = 0\) para facilitar la interpretación didáctica.

---

## Relación con Procesamiento Digital de Señales

- **Muestreo**: conversión de una señal continua en una secuencia discreta; relación entre ventana temporal, número de muestras y frecuencia de muestreo efectiva.
- **DFT**: definición, interpretación como muestreo en frecuencia de la transformada de Fourier de una secuencia finita; relación índice \(k\)–frecuencia \(f_k\); rango de Nyquist \([-F_s/2, F_s/2]\) o \([0, F_s/2]\) en unilateral.
- **Espectro de magnitud**: contenido frecuencial de la señal; picos en las frecuencias presentes (p. ej. una sinusoide a \(f_0\) Hz produce un pico en \(\pm f_0\) en el espectro bilateral).
- **Ventana finita**: la señal analizada es la restricción a un intervalo; efectos de truncamiento (derrame espectral) y relación con el enventanado en PDS.
- **Transición a FFT**: la DFT directa tiene complejidad \(O(N^2)\); la FFT reduce el costo a \(O(N\log N)\) y es la base del análisis espectral en tiempo real y de laboratorio.

---

## Estructura del proyecto

```
src/
├── App.tsx                 # Estado, muestreo, DFT, espectro bilateral, gráficas
├── lib/
│   ├── dft.ts              # sampleSignal, dftDirect, computeSpectrum, effectiveSampleRate
│   ├── fourier.ts          # Re-export del tipo SignalFunction
│   ├── signals.ts          # Señales predefinidas
│   └── customExpression.ts # createCustomSignal (mathjs)
└── components/
    ├── TimeChart.tsx       # Gráfica señal en el tiempo
    └── SpectrumChart.tsx   # Gráfica |X(f)| vs f (Hz)
```

---

## Desarrollo

```bash
npm install
npm run dev
```

Build para producción: `npm run build`. Se puede desplegar en [Vercel](https://vercel.com) u otro host estático.

---

## Tecnologías

- **Vite** + **React** + **TypeScript**
- **Recharts**: gráficas (LineChart para tiempo y espectro)
- **Tailwind CSS**: estilos
- **mathjs**: evaluación de expresiones matemáticas para señales personalizadas
