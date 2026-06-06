import { useState, useRef, useEffect } from 'react';

function VenmoIcon() {
  return (
    <svg viewBox="0 0 60 60">
      <rect width="60" height="60" rx="13" fill="#3D95CE" />
      <path
        d="M 14,13 L 24,13 Q 28,13 30,19 L 34,33 L 40,13 L 50,13 L 36,47 L 26,47 Z"
        fill="white"
      />
    </svg>
  );
}

function SafewayIcon() {
  return (
    <svg viewBox="0 0 60 60">
      <rect width="60" height="60" rx="13" fill="#D0021B" />
      <path
        d="M 41,19 C 41,12 33,10 27,13 C 20,17 20,24 27,28 C 32,31 37,32 38,37 C 39,43 33,48 26,46 C 19,44 17,38 19,33"
        fill="none"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PokemonIcon() {
  return (
    <svg viewBox="0 0 60 60">
      <rect width="60" height="60" rx="13" fill="#60AAEF" />
      {/* confetti */}
      <rect x="8"  y="10" width="5" height="3" rx="1" fill="#F9E03B" transform="rotate(-30 8 10)"/>
      <rect x="44" y="8"  width="5" height="3" rx="1" fill="#E53935" transform="rotate(20 44 8)"/>
      <rect x="48" y="42" width="4" height="3" rx="1" fill="#66BB6A" transform="rotate(-15 48 42)"/>
      <rect x="7"  y="44" width="4" height="3" rx="1" fill="#AB47BC" transform="rotate(25 7 44)"/>
      <rect x="28" y="6"  width="4" height="3" rx="1" fill="#EF5350" transform="rotate(10 28 6)"/>
      <rect x="14" y="48" width="5" height="3" rx="1" fill="#29B6F6" transform="rotate(-20 14 48)"/>
      <rect x="42" y="48" width="5" height="3" rx="1" fill="#F9E03B" transform="rotate(15 42 48)"/>
      {/* pokeball red top */}
      <path d="M 11,31 A 19,19 0 0 1 49,31 Z" fill="#E53935" />
      {/* pokeball white bottom */}
      <path d="M 11,31 A 19,19 0 0 0 49,31 Z" fill="white" />
      {/* outline */}
      <circle cx="30" cy="31" r="19" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
      {/* divider line */}
      <line x1="11" y1="31" x2="49" y2="31" stroke="#1a1a1a" strokeWidth="2.5" />
      {/* center button */}
      <circle cx="30" cy="31" r="6.5" fill="white" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="30" cy="31" r="3"   fill="#1a1a1a" />
    </svg>
  );
}

const ICONS = { venmo: VenmoIcon, safeway: SafewayIcon, pokemon: PokemonIcon };

const isMobile = window.matchMedia('(pointer: coarse)').matches;

// x/y are percentages of the overlay container
const DEFAULT_APPS = isMobile ? [
  { id: 'safeway', label: 'Safeway', href: 'https://github.com/oscarlk', x: 8,  y: 76 },
  { id: 'venmo',   label: 'Venmo',   href: 'https://github.com/oscarlk', x: 38, y: 84 },
  { id: 'pokemon', label: 'Pokémon GO', href: 'https://github.com/oscarlk', x: 65, y: 80 },
] : [
  { id: 'safeway', label: 'Safeway',    href: 'https://github.com/oscarlk', x: 58, y: 22 },
  { id: 'venmo',   label: 'Venmo',      href: 'https://github.com/oscarlk', x: 72, y: 38 },
  { id: 'pokemon', label: 'Pokémon GO', href: 'https://github.com/oscarlk', x: 84, y: 30 },
];

export default function AppGrid() {
  const [apps, setApps]         = useState(DEFAULT_APPS);
  const [jiggling, setJiggling] = useState(false);

  const overlayRef   = useRef(null);
  const jigglingRef  = useRef(false);
  const longTimer    = useRef(null);
  const dragState    = useRef(null);

  // keep ref in sync so pointer callbacks aren't stale
  useEffect(() => { jigglingRef.current = jiggling; }, [jiggling]);

  // tap outside any icon → exit jiggle
  useEffect(() => {
    if (!jiggling) return;
    function onDown(e) {
      if (!e.target.closest('.app-item')) setJiggling(false);
    }
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [jiggling]);

  function handlePointerDown(e, app) {
    e.preventDefault();
    e.stopPropagation();

    const overlay = overlayRef.current;
    const rect    = overlay.getBoundingClientRect();

    dragState.current = {
      id:         app.id,
      startPtrX:  e.clientX,
      startPtrY:  e.clientY,
      startAppX:  app.x,
      startAppY:  app.y,
      moved:      false,
    };

    // long press → jiggle
    longTimer.current = setTimeout(() => {
      dragState.current = null;
      setJiggling(true);
    }, 500);

    function onMove(mv) {
      const ds = dragState.current;
      if (!ds) return;
      const dx = mv.clientX - ds.startPtrX;
      const dy = mv.clientY - ds.startPtrY;

      if (!ds.moved && Math.hypot(dx, dy) > 6) {
        ds.moved = true;
        clearTimeout(longTimer.current);
      }
      if (!ds.moved) return;

      const newX = Math.max(0, Math.min(88, ds.startAppX + (dx / rect.width)  * 100));
      const newY = Math.max(0, Math.min(88, ds.startAppY + (dy / rect.height) * 100));
      setApps(prev => prev.map(a => a.id === ds.id ? { ...a, x: newX, y: newY } : a));
    }

    function onUp() {
      clearTimeout(longTimer.current);
      const ds = dragState.current;
      dragState.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);

      if (ds && !ds.moved) {
        if (jigglingRef.current) {
          setJiggling(false);
        } else {
          window.open(app.href, '_blank', 'noopener');
        }
      }
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  }

  function deleteApp(e, id) {
    e.stopPropagation();
    setApps(prev => {
      const next = prev.filter(a => a.id !== id);
      if (next.length === 0) setJiggling(false);
      return next;
    });
  }

  return (
    <div className="app-overlay" ref={overlayRef}>
      {apps.map(app => {
        const Icon = ICONS[app.id];
        return (
          <div
            key={app.id}
            className={`app-item${jiggling ? ' jiggling' : ''}`}
            style={{ left: `${app.x}%`, top: `${app.y}%` }}
            onPointerDown={e => handlePointerDown(e, app)}
          >
            {jiggling && (
              <button
                className="app-delete"
                onPointerDown={e => e.stopPropagation()}
                onClick={e => deleteApp(e, app.id)}
              >
                ×
              </button>
            )}
            <div className="app-icon"><Icon /></div>
            <span className="app-label">{app.label}</span>
          </div>
        );
      })}
    </div>
  );
}
