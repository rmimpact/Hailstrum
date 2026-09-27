/**
 * Top-down line drawing of the Stork airframe: a fixed wing with four VTOL
 * rotor booms and a pusher prop.
 *
 * Drawn with `currentColor` so it inherits the surrounding text colour and
 * needs no separate dark-mode artwork. The rotor sweep animates via CSS, and
 * stops entirely under prefers-reduced-motion (handled globally in globals.css).
 */
export function AircraftSchematic({ className = "" }: { className?: string }) {
  const rotors = [
    { x: 168, y: 150 },
    { x: 432, y: 150 },
    { x: 168, y: 312 },
    { x: 432, y: 312 },
  ];

  return (
    <svg
      viewBox="0 0 600 440"
      fill="none"
      role="img"
      aria-label="Top-down schematic of the Stork airframe: a fixed wing with four vertical-lift rotor booms and a rear pusher propeller."
      className={className}
    >
      <defs>
        <linearGradient id="hs-fuse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Engineering-paper grid */}
      <g stroke="currentColor" strokeOpacity="0.07">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="440" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
        ))}
      </g>

      {/* Centreline + wingspan dimension */}
      <g stroke="currentColor" strokeOpacity="0.3" strokeDasharray="6 6">
        <line x1="300" y1="30" x2="300" y2="412" />
      </g>
      <g stroke="currentColor" strokeOpacity="0.35" strokeWidth="1">
        <line x1="70" y1="404" x2="530" y2="404" />
        <line x1="70" y1="396" x2="70" y2="412" />
        <line x1="530" y1="396" x2="530" y2="412" />
      </g>

      {/* Main wing */}
      <path
        d="M70 214 L246 198 L354 198 L530 214 L530 236 L354 226 L246 226 L70 236 Z"
        fill="url(#hs-fuse)"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Fuselage */}
      <path
        d="M300 46 C 282 98, 274 150, 274 212 L274 318 C 274 346, 286 362, 300 374 C 314 362, 326 346, 326 318 L326 212 C 326 150, 318 98, 300 46 Z"
        fill="url(#hs-fuse)"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Tail stabiliser */}
      <path
        d="M196 332 L282 324 L318 324 L404 332 L404 346 L318 340 L282 340 L196 346 Z"
        fill="url(#hs-fuse)"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Rotor booms */}
      {[168, 432].map((x) => (
        <rect
          key={x}
          x={x - 7}
          y="132"
          width="14"
          height="198"
          rx="7"
          fill="url(#hs-fuse)"
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1.4"
        />
      ))}

      {/* Lift rotors */}
      {rotors.map((r, i) => (
        <g key={i}>
          <circle
            cx={r.x}
            cy={r.y}
            r="42"
            stroke="var(--accent)"
            strokeOpacity="0.28"
            strokeWidth="1.2"
          />
          <g
            className="hs-rotor"
            style={{
              transformOrigin: `${r.x}px ${r.y}px`,
              animationDelay: `${i * -0.35}s`,
              animationDirection: i % 2 ? "reverse" : "normal",
            }}
          >
            <circle
              cx={r.x}
              cy={r.y}
              r="34"
              stroke="var(--accent)"
              strokeOpacity="0.6"
              strokeWidth="2"
              strokeDasharray="30 18"
              strokeLinecap="round"
            />
          </g>
          <circle cx={r.x} cy={r.y} r="5" fill="var(--accent)" fillOpacity="0.7" />
        </g>
      ))}

      {/* Rear pusher propeller, seen edge-on from above */}
      <g stroke="var(--accent)" strokeLinecap="round">
        <line
          x1="266"
          y1="382"
          x2="334"
          y2="382"
          strokeOpacity="0.6"
          strokeWidth="2"
        />
        <line
          x1="274"
          y1="382"
          x2="326"
          y2="382"
          strokeOpacity="0.25"
          strokeWidth="7"
        />
      </g>
      <circle cx="300" cy="382" r="4" fill="var(--accent)" fillOpacity="0.7" />

      {/* Callouts */}
      <g
        fontSize="11"
        fontFamily="var(--font-display)"
        letterSpacing="1.4"
        fill="currentColor"
        fillOpacity="0.45"
      >
        <text x="300" y="424" textAnchor="middle">
          WINGSPAN
        </text>
        <text x="432" y="96" textAnchor="middle" fillOpacity="0.4">
          VTOL
        </text>
        <text x="348" y="386" fillOpacity="0.4">
          CRUISE
        </text>
      </g>

      <style>{`
        @keyframes hs-spin { to { transform: rotate(360deg); } }
        .hs-rotor { animation: hs-spin 2.6s linear infinite; }
      `}</style>
    </svg>
  );
}
