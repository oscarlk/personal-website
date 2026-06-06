export const THEMES = {
  rolandGarros: {
    id: 'rolandGarros',
    label: 'Roland Garros',
    clay: '#c2622a', clayDark: '#b0571f',
    lines: '#e8d5b0', net: '#d4c4a8', netPost: '#a08060',
    you:  { shirt: '#3a8a3a', shirtDark: '#1a6a1a', stripe: '#ffffff' },
    cpu:  { shirt: '#3a8a3a', shirtDark: '#1a6a1a' },
  },
  wimbledon: {
    id: 'wimbledon',
    label: 'Roland Garros',
    clay: '#3a7a32', clayDark: '#2f6628',
    lines: '#f0f0e8', net: '#d8d8cc', netPost: '#8a9870',
    you:  { shirt: '#f0f0f0', shirtDark: '#cccccc', headband: true },
    cpu:  { shirt: '#f0f0f0', shirtDark: '#cccccc' },
  },
  usOpen: {
    id: 'usOpen',
    label: 'Roland Garros',
    clay: '#2a5fa8', clayDark: '#1e4f96',
    lines: '#e8e8e0', net: '#c8c8c0', netPost: '#7090b8',
    you:  { shirt: '#e870a0', shirtDark: '#c04070' },
    cpu:  { shirt: '#7a1020', shirtDark: '#4a0010' },
  },
  laverCup: {
    id: 'laverCup',
    label: 'Roland Garros',
    clay: '#111111', clayDark: '#0a0a0a',
    lines: '#e0e0e0', net: '#888888', netPost: '#555555',
    you:  { shirt: '#e84040', shirtDark: '#801010' },
    cpu:  { shirt: '#4080e8', shirtDark: '#103080' },
  },
};

const SWATCHES = {
  rolandGarros: { court: '#c2622a', line: '#e8d5b0' },
  wimbledon:    { court: '#3a7a32', line: '#f0f0e8' },
  usOpen:       { court: '#2a5fa8', line: '#e8e8e0' },
  laverCup:     { court: '#111111', line: '#e0e0e0' },
};

const DISPLAY_LABELS = {
  rolandGarros: 'Roland Garros',
  wimbledon:    'Wimbledon',
  usOpen:       'US Open',
  laverCup:     'Laver Cup',
};

export default function ThemeSwitcher({ current, onChange }) {
  return (
    <div className="theme-switcher">
      {Object.values(THEMES).map((t) => {
        const { court, line } = SWATCHES[t.id];
        const active = current === t.id;
        return (
          <button
            key={t.id}
            className={`theme-btn ${active ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
            style={{ '--court': court, '--line': line }}
          >
            <span className="theme-court">
              <span className="theme-net" />
              <span className="theme-line theme-line-v" />
              <span className="theme-line theme-line-h" />
            </span>
            <span className="theme-label">{DISPLAY_LABELS[t.id]}</span>
          </button>
        );
      })}
    </div>
  );
}
