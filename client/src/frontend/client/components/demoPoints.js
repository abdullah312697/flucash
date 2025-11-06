// demoPoints.js
export function makeDemoPoints({
  count = 30,             // number of points
  stepMs = 60_000,        // spacing between points (default 1 minute)
  base = 100,             // baseline value
  amplitude = 5,          // wave amplitude
  noise = 0.8,            // random noise range
} = {}) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const t = now - (count - 1 - i) * stepMs;
    const v = base + Math.sin(i / 4) * amplitude + (Math.random() - 0.5) * noise;
    return { x: t, y: Number(v.toFixed(2)) };
  });
}
