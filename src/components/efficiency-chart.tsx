"use client";

import { useId, useMemo, useRef, useState } from "react";

/**
 * Propulsion efficiency against advance ratio, from the Stork propeller model.
 *
 * ---------------------------------------------------------------------------
 * HAILSTRUM: replace CURVE with your real CFD / thrust-rig output. Each entry
 * is { j: advance ratio, eta: propulsion efficiency in percent }. The peak
 * marker and all labels are derived from the data, so nothing else needs
 * editing when you swap these numbers.
 * ---------------------------------------------------------------------------
 */
const CURVE: { j: number; eta: number }[] = [
  { j: 0.05, eta: 31.0 },
  { j: 0.08, eta: 45.5 },
  { j: 0.11, eta: 58.0 },
  { j: 0.14, eta: 68.5 },
  { j: 0.17, eta: 77.0 },
  { j: 0.2, eta: 83.5 },
  { j: 0.22, eta: 86.0 },
  { j: 0.24, eta: 84.5 },
  { j: 0.26, eta: 76.0 },
  { j: 0.28, eta: 58.0 },
  { j: 0.3, eta: 33.0 },
];

const TARGET = 80; // the >80% design goal

const W = 720;
const H = 420;
const PAD = { top: 28, right: 26, bottom: 54, left: 58 };
const X0 = PAD.left;
const X1 = W - PAD.right;
const Y0 = PAD.top;
const Y1 = H - PAD.bottom;

const J_MIN = 0.05;
const J_MAX = 0.3;
const ETA_MAX = 90;

const sx = (j: number) => X0 + ((j - J_MIN) / (J_MAX - J_MIN)) * (X1 - X0);
const sy = (eta: number) => Y1 - (eta / ETA_MAX) * (Y1 - Y0);

/** Catmull-Rom through the points, emitted as cubic beziers. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function EfficiencyChart() {
  const titleId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const points = useMemo(
    () => CURVE.map((d) => ({ x: sx(d.j), y: sy(d.eta) })),
    []
  );

  const peakIndex = useMemo(() => {
    let best = 0;
    CURVE.forEach((d, i) => {
      if (d.eta > CURVE[best].eta) best = i;
    });
    return best;
  }, []);

  const linePath = useMemo(() => smoothPath(points), [points]);
  const areaPath = `${linePath} L ${points.at(-1)!.x} ${Y1} L ${points[0].x} ${Y1} Z`;

  const yTicks = [0, 20, 40, 60, 80];
  const xTicks = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3];

  const active = hover ?? peakIndex;
  const activePoint = points[active];
  const activeDatum = CURVE[active];

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Map pointer position into viewBox units, then to the nearest sample.
    const vbX = ((event.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - vbX);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = i;
      }
    });
    setHover(nearest);
  }

  return (
    <figure className="m-0">
      <figcaption className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 id={titleId} className="text-base font-semibold">
          Propulsion efficiency vs advance ratio
        </h3>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          {showTable ? "Show chart" : "Show data table"}
        </button>
      </figcaption>
      <p className="mb-4 text-sm text-ink-muted">
        Stork propeller model. Peak {CURVE[peakIndex].eta.toFixed(1)}% at J ={" "}
        {CURVE[peakIndex].j.toFixed(2)}, against a design target of{" "}
        {"> "}
        {TARGET}%.
      </p>

      {showTable ? (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Propulsion efficiency by advance ratio
            </caption>
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left">
                <th scope="col" className="px-4 py-2.5 font-semibold text-ink">
                  Advance ratio (J)
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-ink">
                  Efficiency (%)
                </th>
              </tr>
            </thead>
            <tbody className="[font-variant-numeric:tabular-nums]">
              {CURVE.map((d, i) => (
                <tr
                  key={d.j}
                  className={`border-b border-line last:border-0 ${
                    i === peakIndex ? "bg-accent-soft" : ""
                  }`}
                >
                  <td className="px-4 py-2 text-ink-body">{d.j.toFixed(2)}</td>
                  <td className="px-4 py-2 text-ink-body">
                    {d.eta.toFixed(1)}
                    {i === peakIndex && (
                      <span className="ml-2 text-xs font-semibold text-accent-ink">
                        peak
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-none select-none"
            style={{ height: "auto" }}
            role="img"
            aria-labelledby={titleId}
            onPointerMove={handleMove}
            onPointerLeave={() => setHover(null)}
          >
            {/* Gridlines: solid hairlines, one step off the surface. */}
            <g stroke="var(--chart-grid)" strokeWidth="1">
              {yTicks.map((t) => (
                <line key={t} x1={X0} y1={sy(t)} x2={X1} y2={sy(t)} />
              ))}
            </g>

            {/* Axis ticks */}
            <g
              fill="var(--ink-muted)"
              fontSize="12"
              className="[font-variant-numeric:tabular-nums]"
            >
              {yTicks.map((t) => (
                <text key={t} x={X0 - 12} y={sy(t) + 4} textAnchor="end">
                  {t}
                </text>
              ))}
              {xTicks.map((t) => (
                <text key={t} x={sx(t)} y={Y1 + 24} textAnchor="middle">
                  {t.toFixed(2)}
                </text>
              ))}
            </g>

            {/* Axis titles */}
            <text
              x={(X0 + X1) / 2}
              y={H - 12}
              textAnchor="middle"
              fill="var(--ink-muted)"
              fontSize="12"
              fontFamily="var(--font-display)"
              letterSpacing="0.08em"
            >
              ADVANCE RATIO (J)
            </text>
            <text
              x={-(Y0 + Y1) / 2}
              y={16}
              transform="rotate(-90)"
              textAnchor="middle"
              fill="var(--ink-muted)"
              fontSize="12"
              fontFamily="var(--font-display)"
              letterSpacing="0.08em"
            >
              EFFICIENCY (%)
            </text>

            {/* Target threshold — dashed because it is a threshold, not a grid. */}
            <line
              x1={X0}
              y1={sy(TARGET)}
              x2={X1}
              y2={sy(TARGET)}
              stroke="var(--ink-muted)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
            />
            <text
              x={X1}
              y={sy(TARGET) - 9}
              textAnchor="end"
              fill="var(--ink-muted)"
              fontSize="12"
              fontWeight="600"
            >
              {TARGET}% target
            </text>

            {/* Area wash + line */}
            <path d={areaPath} fill="var(--chart-series)" fillOpacity="0.1" />
            <path
              d={linePath}
              fill="none"
              stroke="var(--chart-series)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Crosshair on the hovered sample */}
            {hover !== null && (
              <line
                x1={activePoint.x}
                y1={Y0}
                x2={activePoint.x}
                y2={Y1}
                stroke="var(--ink-muted)"
                strokeWidth="1"
                strokeOpacity="0.45"
              />
            )}

            {/* Peak marker, with a surface ring so it stays legible on the line */}
            <circle
              cx={points[peakIndex].x}
              cy={points[peakIndex].y}
              r="5"
              fill="var(--chart-series)"
              stroke="var(--surface)"
              strokeWidth="2"
            />
            {hover !== null && hover !== peakIndex && (
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill="var(--chart-series)"
                stroke="var(--surface)"
                strokeWidth="2"
              />
            )}

            {/* The one direct label: the extreme. */}
            <text
              x={points[peakIndex].x}
              y={points[peakIndex].y - 16}
              textAnchor="middle"
              fill="var(--ink)"
              fontSize="14"
              fontWeight="600"
            >
              {CURVE[peakIndex].eta.toFixed(1)}%
            </text>

            {/* Axis rules */}
            <g stroke="var(--line-strong)" strokeWidth="1">
              <line x1={X0} y1={Y1} x2={X1} y2={Y1} />
              <line x1={X0} y1={Y0} x2={X0} y2={Y1} />
            </g>
          </svg>

          {/* Tooltip. Values are also in the table view, so it enhances rather
              than gates. */}
          {hover !== null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lift"
              style={{
                left: `${(activePoint.x / W) * 100}%`,
                top: `${(activePoint.y / H) * 100 - 3}%`,
              }}
            >
              <p className="font-semibold text-ink [font-variant-numeric:tabular-nums]">
                {activeDatum.eta.toFixed(1)}% efficiency
              </p>
              <p className="mt-0.5 text-ink-muted [font-variant-numeric:tabular-nums]">
                J = {activeDatum.j.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
