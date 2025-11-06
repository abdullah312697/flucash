import { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";

export default function Sparkline({
  points = [],
  height = 35,
  width = 120,
  color,
  withArea = true,
  useUTC = false,
  className,
}) {
  // Normalize x to Date for Nivo time scale
  const data = useMemo(() => {
    const norm = (points || []).map((p) => ({
      x: p?.x instanceof Date ? p.x : new Date(p?.x ?? Date.now()),
      y: Number(p?.y ?? 0),
    }));
    return [{ id: "Trend", data: norm }];
  }, [points]);

  // Auto color: green if last >= first, else red (overridden by prop)
  const autoColor = useMemo(() => {
    if (color) return color;
    const d = data[0]?.data || [];
    if (d.length < 2) return "#9ca3af"; // neutral if not enough points
    const first = d[0].y;
    const last = d[d.length - 1].y;
    return last >= first ? "#22c55e" : "#ef4444";
  }, [data, color]);

  // Unique gradient id so multiple instances don't clash
  const gradientId = useMemo(
    () => `sparkGradient-${Math.random().toString(36).slice(2)}`,
    []
  );

  return (
    <div style={{ width, height }} className={className}>
      <ResponsiveLine
        data={data}
        // Time scale (use Date objects for x)
        xScale={{ type: "time", format: "native", useUTC, precision: "minute" }}
        yScale={{ type: "linear", min: "auto", max: "auto", nice: true }}
        // Sparkline look: no axes, no grid, no points
        axisBottom={null}
        axisLeft={null}
        enableGridX={false}
        enableGridY={false}
        enablePoints={false}
        useMesh={false}
        crosshairType="none"
        // Aesthetic
        curve="monotoneX"
        lineWidth={2}
        colors={[autoColor]}
        enableArea={withArea}
        areaOpacity={0.15}
        defs={[
          {
            id: gradientId,
            type: "linearGradient",
            colors: [
              { offset: 0, color: autoColor, opacity: 0.18 },
              { offset: 100, color: autoColor, opacity: 0 },
            ],
          },
        ]}
        fill={withArea ? [{ match: "*", id: gradientId }] : []}
        margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
        animate={false} // crisp and real-time friendly
        // Optional dark theme bits
        theme={{
          background: "transparent",
          textColor: "#e5e7eb",
          grid: { line: { stroke: "#111827" } },
          tooltip: {
            container: {
              background: "#111827",
              color: "#f3f4f6",
              border: "1px solid #374151",
            },
          },
        }}
        // Usually disable tooltips for tiny charts
        tooltip={() => null}
      />
    </div>
  );
}
