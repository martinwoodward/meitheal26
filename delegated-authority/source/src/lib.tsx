import React from 'react';
import {
  AbsoluteFill, Img, staticFile, interpolate, spring, useCurrentFrame,
  useVideoConfig, Easing, delayRender, continueRender,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';

const {fontFamily: poppins} = loadFont('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});

if (typeof window !== 'undefined' && !(window as any).__brico) {
  (window as any).__brico = true;
  const h = delayRender('bricolage');
  const f = new FontFace('Bricolage', `url(${staticFile('Bricolage.ttf')})`, {weight: '200 800'});
  f.load().then(() => { (document as any).fonts.add(f); continueRender(h); }).catch(() => continueRender(h));
}

export const C = {
  bg: '#eef1f1', teal: '#073b49', sky: '#099dd5', light: '#40bceb', copper: '#b45f2e',
  muted: '#526b72', border: '#d3e0e1', green: '#1f8a5b', red: '#c0392b', white: '#ffffff',
  accent: '#dce8e9', dark: '#0c1416',
};
export const HEAD = 'Bricolage, sans-serif';
export const BODY = poppins;
export type P = [number, number];

const io = Easing.inOut(Easing.cubic);
export const ease = (f: number, a: number, b: number, x = 0, y = 1) =>
  interpolate(f, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: io});

export const usePop = (at: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - at, fps, config: {damping: 14, stiffness: 120}});
};

export const Stage: React.FC<{children: React.ReactNode; tag?: string}> = ({children, tag}) => (
  <AbsoluteFill style={{background: C.bg, fontFamily: BODY, color: C.teal}}>
    <svg width="1920" height="880" style={{position: 'absolute', opacity: 0.35}}>
      <defs>
        <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill={C.muted} />
        </pattern>
      </defs>
      <rect width="1920" height="880" fill="url(#dots)" />
    </svg>
    {children}
    {tag ? (
      <div style={{position: 'absolute', top: 18, right: 24, fontSize: 18, fontWeight: 600, letterSpacing: 2,
        color: C.copper, border: `2px solid ${C.copper}`, borderRadius: 8, padding: '4px 12px', background: '#ffffffcc', zIndex: 50}}>
        {tag}
      </div>
    ) : null}
  </AbsoluteFill>
);

export const Icon: React.FC<{name: string; color?: string; size: number; style?: React.CSSProperties}> =
  ({name, color = 'teal', size, style}) => (
    <Img src={staticFile(`${name}-${color}.png`)} style={{width: size, height: size, ...style}} />
  );

export const Actor: React.FC<{p: P; icon: string; label: string; sub?: string; at?: number;
  compact?: boolean; w?: number; iconColor?: string; dimAt?: number}> =
  ({p, icon, label, sub, at = 0, compact, w, iconColor = 'sky', dimAt}) => {
    const f = useCurrentFrame();
    const s = usePop(at);
    const dim = dimAt ? interpolate(f, [dimAt, dimAt + 15], [1, 0.45], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
    const W = w ?? (compact ? 290 : 300);
    return (
      <div style={{position: 'absolute', left: p[0], top: p[1], width: W,
        transform: `translate(-50%,-50%) scale(${0.85 + 0.15 * s})`, opacity: s * dim,
        background: C.white, border: `2px solid ${C.border}`, borderRadius: 22,
        boxShadow: '0 10px 30px rgba(7,59,73,0.10)', padding: compact ? '14px 16px' : '22px 20px',
        display: 'flex', flexDirection: compact ? 'row' : 'column', alignItems: 'center',
        gap: compact ? 14 : 8, textAlign: compact ? 'left' : 'center'}}>
        <div style={{background: C.accent, borderRadius: 18, padding: compact ? 10 : 14, display: 'flex', flexShrink: 0}}>
          <Icon name={icon} color={iconColor} size={compact ? 48 : 72} />
        </div>
        <div>
          <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: compact ? 25 : 30, lineHeight: 1.1}}>{label}</div>
          {sub ? <div style={{fontSize: compact ? 15 : 18, color: C.muted, marginTop: 4, lineHeight: 1.25}}>{sub}</div> : null}
        </div>
      </div>
    );
  };

export const Packet: React.FC<{from: P; to: P; start: number; dur?: number; label: string;
  color?: string; icon?: string; curve?: number; hold?: number}> =
  ({from, to, start, dur = 40, label, color = C.teal, icon, curve = 0, hold = 6}) => {
    const f = useCurrentFrame();
    if (f < start - 8 || f > start + dur + hold + 10) return null;
    const t = ease(f, start, start + dur);
    const op = interpolate(f, [start - 8, start, start + dur + hold, start + dur + hold + 10], [0, 1, 1, 0],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const dx = to[0] - from[0], dy = to[1] - from[1];
    const len = Math.hypot(dx, dy) || 1;
    const bend = Math.sin(Math.PI * t) * curve;
    const x = from[0] + dx * t + (-dy / len) * bend;
    const y = from[1] + dy * t + (dx / len) * bend;
    return (
      <>
        <svg width="1920" height="880" style={{position: 'absolute', left: 0, top: 0, opacity: op * 0.55, zIndex: 15}}>
          <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={color} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" />
        </svg>
        <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: op,
          background: color, color: '#fff', borderRadius: 999, padding: '10px 22px', fontSize: 21, fontWeight: 600,
          whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(7,59,73,0.25)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 20}}>
          {icon ? <Icon name={icon} color="white" size={26} /> : null}
          {label}
        </div>
      </>
    );
  };

export const Connector: React.FC<{from: P; to: P; start: number; dur?: number; color?: string; dashed?: boolean; width?: number; until?: number}> =
  ({from, to, start, dur = 20, color = C.sky, dashed = true, width = 4, until}) => {
    const f = useCurrentFrame();
    const t = ease(f, start, start + dur);
    if (t <= 0) return null;
    const o = until ? interpolate(f, [until, until + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
    return (
      <svg width="1920" height="880" style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
        <line x1={from[0]} y1={from[1]} x2={from[0] + (to[0] - from[0]) * t} y2={from[1] + (to[1] - from[1]) * t}
          stroke={color} strokeWidth={width} strokeDasharray={dashed ? '10 10' : undefined} strokeLinecap="round" />
      </svg>
    );
  };

export const Badge: React.FC<{p: P; at: number; text: string; color?: string; until?: number; icon?: string; size?: number}> =
  ({p, at, text, color = C.sky, until, icon, size = 19}) => {
    const f = useCurrentFrame();
    const s = usePop(at);
    if (f < at) return null;
    const out = until ? interpolate(f, [until, until + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
    if (out <= 0) return null;
    const ic = color === C.green ? 'green' : color === C.red ? 'red' : color === C.copper ? 'copper' : color === C.muted ? 'teal' : 'sky';
    return (
      <div style={{position: 'absolute', left: p[0], top: p[1], transform: `translate(-50%,-50%) scale(${s})`, opacity: out,
        background: '#fff', color, border: `2.5px solid ${color}`, borderRadius: 999, padding: '6px 16px', fontSize: size,
        fontWeight: 600, whiteSpace: 'nowrap', zIndex: 30, display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 6px 18px rgba(7,59,73,0.15)'}}>
        {icon ? <Icon name={icon} color={ic} size={22} /> : null}
        {text}
      </div>
    );
  };

export const Tick: React.FC<{p: P; at: number; ok?: boolean; size?: number; until?: number}> = ({p, at, ok = true, size = 64, until}) => {
  const f = useCurrentFrame();
  const s = usePop(at);
  if (f < at) return null;
  if (until && f > until) return null;
  return (
    <div style={{position: 'absolute', left: p[0], top: p[1], transform: `translate(-50%,-50%) scale(${s})`, zIndex: 40,
      width: size, height: size, borderRadius: size, background: ok ? C.green : C.red, display: 'flex',
      alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.25)', color: '#fff',
      fontSize: size * 0.55, fontWeight: 700}}>
      {ok ? '✓' : '✕'}
    </div>
  );
};

export const Pulse: React.FC<{p: P; at: number; r?: number; color?: string}> = ({p, at, r = 190, color = C.light}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 45) return null;
  const t = (f - at) / 45;
  return (
    <div style={{position: 'absolute', left: p[0], top: p[1], width: r * 2 * (0.6 + 0.5 * t), height: r * 2 * (0.6 + 0.5 * t),
      transform: 'translate(-50%,-50%)', borderRadius: '50%', border: `5px solid ${color}`, opacity: 1 - t, zIndex: 5}} />
  );
};

export const Captions: React.FC<{items: {at: number; text: string}[]}> = ({items}) => {
  const f = useCurrentFrame();
  let idx = -1;
  items.forEach((it, i) => { if (f >= it.at) idx = i; });
  if (idx < 0) return null;
  const it = items[idx];
  const o = interpolate(f - it.at, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 24, height: 84, background: C.teal, borderRadius: 18,
      display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', color: '#fff', boxShadow: '0 10px 30px rgba(7,59,73,0.25)', zIndex: 60}}>
      <div style={{display: 'flex', gap: 8, flexShrink: 0}}>
        {items.map((_, i) => (
          <div key={i} style={{width: 12, height: 12, borderRadius: 12, background: i === idx ? '#e3875a' : i < idx ? C.light : '#ffffff40'}} />
        ))}
      </div>
      <div style={{opacity: o, transform: `translateY(${(1 - o) * 10}px)`, fontSize: 27, fontWeight: 500, lineHeight: 1.2}}>
        <span style={{fontFamily: HEAD, fontWeight: 800, color: '#e3875a', marginRight: 14}}>{idx + 1}</span>
        {it.text}
      </div>
    </div>
  );
};

export const Phone: React.FC<{p: P; at?: number; w?: number; h?: number; screens: {at: number; node: React.ReactNode}[]}> =
  ({p, at = 0, w = 330, h = 640, screens}) => {
    const f = useCurrentFrame();
    const s = usePop(at);
    return (
      <div style={{position: 'absolute', left: p[0], top: p[1], width: w, height: h, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * s})`,
        opacity: s, background: C.dark, borderRadius: 48, padding: 12, boxShadow: '0 20px 50px rgba(7,59,73,0.35)', zIndex: 10}}>
        <div style={{position: 'relative', width: '100%', height: '100%', background: '#fff', borderRadius: 38, overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 100, height: 28, borderRadius: 20, background: C.dark, zIndex: 5}} />
          {screens.map((sc, i) => {
            const next = screens[i + 1]?.at ?? 1e9;
            const o = interpolate(f, [sc.at, sc.at + 10, next, next + 10], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            if (o <= 0) return null;
            return (
              <div key={i} style={{position: 'absolute', inset: 0, padding: '56px 20px 20px', opacity: o, color: C.teal,
                transform: `translateX(${(1 - Math.min(1, Math.max(0, (f - sc.at) / 10))) * 20}px)`}}>
                {sc.node}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

export const ScrTitle: React.FC<{children: React.ReactNode; sub?: string}> = ({children, sub}) => (
  <div style={{marginBottom: 14}}>
    <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 24, lineHeight: 1.15}}>{children}</div>
    {sub ? <div style={{fontSize: 15, color: C.muted, marginTop: 4, lineHeight: 1.3}}>{sub}</div> : null}
  </div>
);
export const ScrRow: React.FC<{text: string; on?: boolean; off?: boolean; hl?: boolean; warn?: boolean}> = ({text, on, off, hl, warn}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, marginBottom: 6,
    background: warn ? '#fbeaea' : hl ? '#e2f4fb' : C.bg, border: warn ? `2px solid ${C.red}` : hl ? `2px solid ${C.sky}` : '2px solid transparent', fontSize: 15.5,
    color: off ? '#9aa9ad' : warn ? C.red : C.teal, textDecoration: off ? 'line-through' : 'none'}}>
    {on ? <span style={{color: C.green, fontWeight: 700}}>✓</span> : off ? <span>–</span> : warn ? <span style={{fontWeight: 700}}>!</span> : <span style={{color: C.sky}}>●</span>}
    {text}
  </div>
);
export const ScrBtn: React.FC<{text: string; color?: string; second?: string}> = ({text, color = C.teal, second}) => (
  <div style={{position: 'absolute', left: 20, right: 20, bottom: 24, display: 'flex', flexDirection: 'column', gap: 8}}>
    {second ? <div style={{border: `2px solid ${C.border}`, color: C.muted, borderRadius: 14, padding: '10px 0', textAlign: 'center', fontWeight: 600, fontSize: 16}}>{second}</div> : null}
    <div style={{background: color, color: '#fff', borderRadius: 14, padding: '14px 0', textAlign: 'center', fontWeight: 600, fontSize: 18}}>{text}</div>
  </div>
);
export const ScrNote: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.muted}) => (
  <div style={{fontSize: 13.5, color, margin: '8px 2px', lineHeight: 1.35}}>{children}</div>
);
export const CredCard: React.FC<{title: string; sub: string; color?: string; small?: boolean; status?: string}> = ({title, sub, color = C.teal, small, status}) => (
  <div style={{background: color, color: '#fff', borderRadius: 16, position: 'relative',
    padding: small ? '12px 14px' : '18px 16px', marginBottom: 10, boxShadow: '0 6px 16px rgba(7,59,73,0.25)'}}>
    <div style={{fontSize: 12, opacity: 0.85, letterSpacing: 1}}>{sub}</div>
    <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: small ? 18 : 22, marginTop: 4}}>{title}</div>
    {status ? <div style={{position: 'absolute', right: 12, top: 12, fontSize: 12, background: '#ffffff30', borderRadius: 8, padding: '2px 8px'}}>{status}</div> : null}
  </div>
);
