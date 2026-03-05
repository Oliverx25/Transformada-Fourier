# Transformada de Fourier — Espectro de Frecuencia

Aplicación web que calcula y muestra la **Transformada de Fourier** de una señal y su **espectro de frecuencia** (magnitud |X(f)| vs frecuencia).

## Características

- **Señal en el tiempo**: gráfica de la señal f(t) en la ventana de análisis
- **Espectro de frecuencia**: magnitud de la transformada vs frecuencia (Hz)
- **Señales predefinidas**: onda cuadrada, diente de sierra, triangular, sinusoidal, pulso rectangular
- **Expresión personalizada**: introduce f(t) con la variable `t` (sintaxis mathjs)

## Uso

- Elige una señal o escribe una expresión (ej: `sin(2*pi*t)`, `cos(4*pi*t)`).
- La ventana de análisis es [-2, 2] s con 512 muestras (DFT directa).
- El espectro muestra las frecuencias positivas hasta la frecuencia de Nyquist.

## Desarrollo

```bash
npm install
npm run dev
```

## Despliegue en Vercel

Conecta el repositorio en [Vercel](https://vercel.com) o usa `npx vercel`.

## Tecnologías

- Vite + React + TypeScript
- Recharts
- Tailwind CSS
- DFT (método directo) implementada en el proyecto
