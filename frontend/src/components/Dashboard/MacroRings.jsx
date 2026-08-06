import './MacroRings.css';

const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: 'var(--color-calories)' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    color: 'var(--color-protein)' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    color: 'var(--color-carbs)' },
  { key: 'fats',     label: 'Fats',     unit: 'g',    color: 'var(--color-fats)' },
  { key: 'fiber',    label: 'Fiber',    unit: 'g',    color: 'var(--color-fiber)' },
];

function CircleRing({ pct, color, size = 80, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dashoffset = circ - (Math.min(pct, 100) / 100) * circ;

  return (
    <svg width={size} height={size} className="ring-svg">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.25,0.46,0.45,0.94)', filter: `drop-shadow(0 0 6px ${color}55)` }}
      />
    </svg>
  );
}

export default function MacroRings({ consumed, targets, percentConsumed }) {
  if (!consumed || !targets) return null;

  return (
    <div className="macro-rings-container">
      <h3 className="macro-rings-title">Today's Macros</h3>
      <div className="macro-rings-grid">
        {MACROS.map(m => {
          const pct = percentConsumed?.[m.key] ?? 0;
          const cons = consumed[m.key] ?? 0;
          const tgt  = targets?.[`daily${m.key.charAt(0).toUpperCase() + m.key.slice(1)}`] ?? 0;
          const over = pct > 100;

          return (
            <div key={m.key} className="macro-ring-item">
              <div className="macro-ring-circle">
                <CircleRing pct={pct} color={over ? 'var(--danger)' : m.color} />
                <div className="macro-ring-center">
                  <span className="macro-ring-pct" style={{ color: over ? 'var(--danger)' : m.color }}>
                    {Math.min(pct, 100)}%
                  </span>
                </div>
              </div>
              <div className="macro-ring-info">
                <span className="macro-ring-label">{m.label}</span>
                <span className="macro-ring-value">{cons.toFixed(m.unit === 'kcal' ? 0 : 1)}{m.unit}</span>
                <span className="macro-ring-target">/ {tgt}{m.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini progress bars */}
      <div className="macro-bars">
        {MACROS.map(m => {
          const pct = Math.min(percentConsumed?.[m.key] ?? 0, 100);
          return (
            <div key={m.key} className="macro-bar-row">
              <span className="macro-bar-label">{m.label}</span>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${pct}%`, background: m.color }}
                />
              </div>
              <span className="macro-bar-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
