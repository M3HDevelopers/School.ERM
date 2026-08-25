import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// ================= ICONS =================
const P: Record<string, ReactNode> = {
  dash: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  student: <><path d="M22 9 12 4 2 9l10 5 10-5z" /><path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" /><path d="M22 9v5" /></>,
  users: <><circle cx="9" cy="7" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17.5" cy="8.5" r="2.5" /><path d="M16 14.6c2.9.3 5.5 2.3 5.5 5.4" /></>,
  cal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6 12h.01M18 12h.01" /></>,
  exam: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><path d="M14 3v5h5" /><path d="m9 14 2 2 4-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  admit: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M19 6v6M16 9h6" /></>,
  brief: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></>,
  bus: <><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /><path d="M3 11h18M7 17v2M17 17v2" /><circle cx="7.5" cy="14" r=".6" /><circle cx="16.5" cy="14" r=".6" /></>,
  book: <><path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 0 2 2h14" /><path d="M9 7h7" /></>,
  box: <><path d="m12 2 9 5v10l-9 5-9-5V7l9-5z" /><path d="m3 7 9 5 9-5M12 12v10" /></>,
  megaphone: <><path d="M3 11v3l14 5V6L3 11z" /><path d="M7 16.5V20a1.5 1.5 0 0 0 3 0v-2" /><path d="M21 9v6" /></>,
  chart: <><path d="M3 3v18h18" /><path d="m7 15 4-5 3 3 5-7" /></>,
  cog: <><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.09a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m4 12.5 5.5 5.5L20 6.5" />,
  checks: <><path d="m2.5 13 4.5 4.5L16 8" /><path d="m11 13 4.5 4.5L24.5 8" /></>,
  alert: <><path d="M10.3 3.8 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0z" /><path d="M12 9v4.5M12 17.5h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  chevR: <path d="m9 6 6 6-6 6" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  chevL: <path d="m15 6-6 6 6 6" />,
  print: <><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></>,
  download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="M17 3.5a2.1 2.1 0 0 1 3 3L8.5 18l-4 1 1-4L17 3.5z" /></>,
  trash: <><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6M14 11v6" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 8 10 8a13.2 13.2 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.39-1.61" /><path d="m2 2 20 20" /></>,
  filter: <path d="M22 4H2l8 9.5V20l4 2v-8.5L22 4z" />,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>,
  arrowR: <path d="M4 12h16m-6-6 6 6-6 6" />,
  up: <path d="m5 15 7-7 7 7" />,
  down: <path d="m5 9 7 7 7-7" />,
  star: <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />,
  shield: <><path d="M12 2 4 5.5V11c0 5.2 3.4 9.6 8 11 4.6-1.4 8-5.8 8-11V5.5L12 2z" /><path d="m9 11.5 2 2 4-4" /></>,
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="m11 12 9-9M17.5 6.5 20 9M15 9l1.8 1.8" /></>,
  cpu: <><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></>,
  server: <><rect x="2" y="3" width="20" height="7" rx="2" /><rect x="2" y="14" width="20" height="7" rx="2" /><path d="M6 6.5h.01M6 17.5h.01" /></>,
  building: <><rect x="4" y="2" width="16" height="20" rx="1.5" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
  life: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" /></>,
  send: <path d="m22 2-11 11M22 2 15 22l-4-9-9-4 20-7z" />,
  refresh: <><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" /><path d="M21 3v5h-5" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" /></>,
  sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m5.6 5.6 2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></>,
  wand: <><path d="m14 7 3 3L7 20l-3-3L14 7z" /><path d="M5 6v.01M9 3v.01M19 15v.01M18 9l1.5-1.5M21 12v.01" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3.5 2" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  wa: <><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z" /><path d="M8.5 9.5c.5 2.5 3.5 5.5 6 6l1.5-1.5-2-1.5-1 .5c-1-.5-2-1.5-2.5-2.5l.5-1-1.5-2-1 2z" /></>,
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="m7 4 13 8-13 8V4z" />,
  dot: <circle cx="12" cy="12" r="5" />,
  external: <><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M20 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" /></>,
  power: <><path d="M12 2v9" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
  zap: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
};

export function I({ n, size = 18, className = "" }: { n: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      {P[n] ?? P.dot}
    </svg>
  );
}

// ================= PRIMITIVES =================
export function Btn({ children, v = "primary", sz = "md", icon, onClick, className = "", type = "button", disabled }: {
  children?: ReactNode; v?: "primary" | "outline" | "ghost" | "danger" | "subtle" | "accent" | "dark";
  sz?: "xs" | "sm" | "md"; icon?: string; onClick?: () => void; className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  const base = "focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap";
  const szs = { xs: "text-[11px] px-2.5 py-1.5", sm: "text-[12.5px] px-3 py-2", md: "text-[13.5px] px-4 py-2.5" }[sz];
  const vs = {
    primary: "bg-primary text-white hover:bg-primarydark shadow-sm",
    accent: "bg-accent text-[#1f2a25] hover:brightness-95 shadow-sm",
    dark: "bg-night text-canvas hover:bg-night2 shadow-sm",
    outline: "border border-line bg-surface text-ink hover:border-primary/40 hover:text-primary",
    ghost: "text-sub hover:bg-primarysoft/70 hover:text-primarydark",
    subtle: "bg-primarysoft text-primarydark hover:brightness-[0.97]",
    danger: "bg-danger text-white hover:brightness-90 shadow-sm",
  }[v];
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${szs} ${vs} ${className}`}>{icon && <I n={icon} size={sz === "md" ? 16 : 14} />}{children}</button>;
}

const TONES: Record<string, string> = {
  ok: "bg-oksoft text-ok", warn: "bg-warnsoft text-warn", danger: "bg-dangersoft text-danger",
  neutral: "bg-line/70 text-sub", primary: "bg-primarysoft text-primarydark", accent: "bg-accentsoft text-[#7a5c14]",
  night: "bg-night text-canvas",
};
export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: string; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${TONES[tone] ?? TONES.neutral} ${className}`}>{children}</span>;
}

export function StatusDot({ tone = "ok", live }: { tone?: "ok" | "warn" | "danger" | "neutral"; live?: boolean }) {
  const c = { ok: "bg-ok", warn: "bg-warn", danger: "bg-danger", neutral: "bg-sub" }[tone];
  return <span className={`inline-block h-2 w-2 rounded-full ${c} ${live ? "dot-live" : ""}`} />;
}

export function Card({ title, sub, actions, children, className = "", pad = true }: {
  title?: ReactNode; sub?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; pad?: boolean;
}) {
  return (
    <section className={`rounded-xl border border-line bg-surface shadow-[0_1px_2px_rgba(31,42,37,0.05)] ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div><h3 className="display text-[15px] font-semibold text-ink">{title}</h3>{sub && <p className="text-[11.5px] text-sub">{sub}</p>}</div>
          {actions}
        </header>
      )}
      <div className={pad ? "p-4" : ""}>{children}</div>
    </section>
  );
}

// ================= FORMS =================
export const inputCls = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-sub/60 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
export function TextInput(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={`${inputCls} ${p.className ?? ""}`} />;
}
export function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={`${inputCls} resize-y ${p.className ?? ""}`} />;
}
export function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={`${inputCls} appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%235f7166%22%20stroke-width=%222%22><path%20d=%22m6%209%206%206%206-6%22/></svg>')] bg-[right_10px_center] bg-no-repeat pr-8 ${rest.className ?? ""}`}>{children}</select>;
}
export function Field({ label, children, hint, req }: { label: string; children: ReactNode; hint?: string; req?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">{label}{req && <span className="text-danger"> *</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-sub/80">{hint}</span>}
    </label>
  );
}
export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => onChange(!on)} aria-pressed={on}
      className={`toggle-track focus-ring relative h-[22px] w-10 rounded-full ${on ? "bg-primary" : "bg-line"} ${disabled ? "opacity-40" : ""}`}>
      <span className={`toggle-knob absolute top-[3px] left-[3px] h-4 w-4 rounded-full bg-white shadow ${on ? "translate-x-[18px]" : ""}`} />
    </button>
  );
}
export function SearchInput({ value, onChange, placeholder = "Search…", className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <I n="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sub/70" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} pl-9`} />
    </div>
  );
}

// ================= OVERLAYS =================
export function Modal({ open, onClose, title, sub, children, wide, footer }: {
  open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode; wide?: boolean; footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="anim-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/55 p-4 pt-[7vh] backdrop-blur-[2px]" onMouseDown={onClose}>
      <div className={`anim-pop w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-xl border border-line bg-surface shadow-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="flex items-start justify-between border-b border-line px-5 py-4">
          <div><h2 className="display text-[16px] font-semibold text-ink">{title}</h2>{sub && <p className="mt-0.5 text-[12px] text-sub">{sub}</p>}</div>
          <button onClick={onClose} className="focus-ring rounded-md p-1.5 text-sub transition hover:bg-dangersoft hover:text-danger"><I n="x" size={16} /></button>
        </header>
        <div className="max-h-[68vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</footer>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, sub, children, wide, footer }: {
  open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode; wide?: boolean; footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="anim-in fixed inset-0 z-50 bg-night/55 backdrop-blur-[2px]" onMouseDown={onClose}>
      <aside className={`anim-slide absolute right-0 top-0 flex h-full w-full ${wide ? "max-w-2xl" : "max-w-lg"} flex-col border-l border-line bg-canvas shadow-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="flex items-start justify-between border-b border-line bg-surface px-5 py-4">
          <div><h2 className="display text-[16px] font-semibold text-ink">{title}</h2>{sub && <div className="mt-0.5 text-[12px] text-sub">{sub}</div>}</div>
          <button onClick={onClose} className="focus-ring rounded-md p-1.5 text-sub transition hover:bg-dangersoft hover:text-danger"><I n="x" size={16} /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line bg-surface px-5 py-3.5">{footer}</footer>}
      </aside>
    </div>
  );
}

export function Confirm({ open, onClose, onYes, title, body, yesLabel = "Confirm", danger }: {
  open: boolean; onClose: () => void; onYes: () => void; title: string; body: ReactNode; yesLabel?: string; danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<>
        <Btn v="outline" onClick={onClose}>Cancel</Btn>
        <Btn v={danger ? "danger" : "primary"} onClick={() => { onYes(); onClose(); }}>{yesLabel}</Btn>
      </>}>
      <div className="flex gap-3">
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${danger ? "bg-dangersoft text-danger" : "bg-warnsoft text-warn"}`}><I n="alert" size={18} /></span>
        <div className="text-[13px] leading-relaxed text-ink">{body}</div>
      </div>
    </Modal>
  );
}

// ================= TABLES =================
export const thCls = "px-3 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-sub bg-canvas/80 border-b border-line whitespace-nowrap";
export const tdCls = "px-3 py-2.5 text-[12.5px] text-ink border-b border-line/70 align-middle";
export function Tbl({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-max border-collapse bg-surface">
        <thead><tr>{head.map((h, i) => <th key={i} className={thCls}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function Pagination({ page, pages, onPage, total }: { page: number; pages: number; onPage: (p: number) => void; total: number }) {
  if (pages <= 1) return <p className="mt-2 text-[11px] text-sub">{total} record{total === 1 ? "" : "s"}</p>;
  return (
    <div className="mt-3 flex items-center justify-between">
      <p className="text-[11px] text-sub">Showing page <b className="num">{page}</b> of <b className="num">{pages}</b> · {total} records</p>
      <div className="flex gap-1">
        <Btn v="outline" sz="xs" icon="chevL" disabled={page <= 1} onClick={() => onPage(page - 1)} />
        <Btn v="outline" sz="xs" icon="chevR" disabled={page >= pages} onClick={() => onPage(page + 1)} />
      </div>
    </div>
  );
}

export function EmptyState({ icon = "search", title, body, action }: { icon?: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primarysoft text-primarydark"><I n={icon} size={22} /></span>
      <p className="display text-[14px] font-semibold text-ink">{title}</p>
      {body && <p className="max-w-xs text-[12px] text-sub">{body}</p>}
      {action}
    </div>
  );
}

export function Avatar({ name, size = 34, tone = "primary" }: { name: string; size?: number; tone?: "primary" | "accent" | "night" }) {
  const bg = { primary: "bg-primarysoft text-primarydark", accent: "bg-accentsoft text-[#7a5c14]", night: "bg-night text-canvas" }[tone];
  const ini = name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return <span className={`flex shrink-0 items-center justify-center rounded-full font-bold ${bg}`} style={{ width: size, height: size, fontSize: size * 0.34 }}>{ini}</span>;
}

export function Progress({ pct, tone = "primary", className = "" }: { pct: number; tone?: "primary" | "warn" | "danger" | "accent" | "ok"; className?: string }) {
  const bg = { primary: "bg-primary", warn: "bg-warn", danger: "bg-danger", accent: "bg-accent", ok: "bg-ok" }[tone];
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-line/80 ${className}`}>
      <div className={`h-full rounded-full ${bg} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; icon?: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-canvas p-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`focus-ring flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-all ${active === t.id ? "bg-surface text-primarydark shadow-sm border border-line" : "text-sub hover:text-ink"}`}>
          {t.icon && <I n={t.icon} size={14} />}{t.label}
          {t.count !== undefined && <span className={`num rounded px-1.5 text-[10.5px] ${active === t.id ? "bg-primarysoft text-primarydark" : "bg-line/70 text-sub"}`}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ================= CHARTS (inline SVG) =================
export function Spark({ values, tone = "var(--color-primary)", w = 92, h = 30 }: { values: number[]; tone?: string; w?: number; h?: number }) {
  if (!values.length) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={tone} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - 3 - ((values[values.length - 1] - min) / (max - min || 1)) * (h - 6)} r="2.6" fill={tone} />
    </svg>
  );
}

export function LineChart({ data, height = 180, tone = "var(--color-primary)", fmt }: { data: { label: string; value: number }[]; height?: number; tone?: string; fmt?: (v: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 560, h = height, padL = 8, padB = 22, padT = 14;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals) * 0.96, max = Math.max(...vals) * 1.04;
  const X = (i: number) => padL + (i / (data.length - 1)) * (w - padL * 2);
  const Y = (v: number) => padT + (1 - (v - min) / (max - min || 1)) * (h - padT - padB);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${X(i)},${Y(d.value)}`).join(" ");
  const area = `${path} L${X(data.length - 1)},${h - padB} L${X(0)},${h - padB} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" onMouseLeave={() => setHover(null)}>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={padL} x2={w - padL} y1={padT + f * (h - padT - padB)} y2={padT + f * (h - padT - padB)} stroke="var(--color-line)" strokeDasharray="3 4" strokeWidth="1" />)}
      <path d={area} fill={tone} opacity="0.09" />
      <path d={path} fill="none" stroke={tone} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i} onMouseEnter={() => setHover(i)}>
          <rect x={X(i) - 20} y={0} width={40} height={h} fill="transparent" />
          <circle cx={X(i)} cy={Y(d.value)} r={hover === i ? 4.5 : 3} fill="var(--color-surface)" stroke={tone} strokeWidth="2" />
          <text x={X(i)} y={h - 7} textAnchor="middle" fontSize="9.5" fill="var(--color-sub)">{d.label}</text>
          {hover === i && (
            <g>
              <rect x={Math.min(Math.max(X(i) - 40, 2), w - 82)} y={Y(d.value) - 27} width={80} height={19} rx={5} fill="var(--color-night)" />
              <text x={Math.min(Math.max(X(i), 42), w - 42)} y={Y(d.value) - 14} textAnchor="middle" fontSize="10" fontWeight={600} fill="#f2f0e9">{fmt ? fmt(d.value) : d.value.toLocaleString()}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

export function Bars({ data, height = 170, tone = "var(--color-primary)", fmt }: { data: { label: string; value: number }[]; height?: number; tone?: string; fmt?: (v: number) => string }) {
  const w = 560, h = height, padB = 22, padT = 16;
  const max = Math.max(...data.map((d) => d.value)) * 1.08;
  const bw = (w - 20) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {data.map((d, i) => {
        const bh = (d.value / max) * (h - padT - padB);
        return (
          <g key={i}>
            <rect x={10 + i * bw + bw * 0.2} y={h - padB - bh} width={bw * 0.6} height={bh} rx={4} fill={tone} opacity="0.88" className="transition-opacity hover:opacity-100" />
            <text x={10 + i * bw + bw * 0.2 + bw * 0.3} y={h - padB - bh - 5} textAnchor="middle" fontSize="9.5" fontWeight={600} fill="var(--color-sub)">{fmt ? fmt(d.value) : d.value}</text>
            <text x={10 + i * bw + bw * 0.2 + bw * 0.3} y={h - 7} textAnchor="middle" fontSize="9.5" fill="var(--color-sub)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function HBars({ data, fmt }: { data: { label: string; v: number; tone?: string; right?: string }[]; fmt?: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
            <span className="font-medium text-ink">{d.label}</span>
            <span className="num font-semibold text-sub">{d.right ?? (fmt ? fmt(d.v) : d.v)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-line/70">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.v / max) * 100}%`, background: d.tone ?? "var(--color-primary)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ data, centerLabel, size = 148 }: { data: { label: string; value: number; color: string }[]; centerLabel?: string; size?: number }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const R = 54, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 148 148">
        <circle cx="74" cy="74" r={R} fill="none" stroke="var(--color-line)" strokeWidth="16" />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = `${frac * C} ${C}`;
          const off = -acc * C;
          acc += frac;
          return <circle key={i} cx="74" cy="74" r={R} fill="none" stroke={d.color} strokeWidth="16" strokeDasharray={dash} strokeDashoffset={off} transform="rotate(-90 74 74)" strokeLinecap="butt" className="transition-all duration-700" />;
        })}
        <text x="74" y="70" textAnchor="middle" fontSize="22" fontWeight={700} fill="var(--color-ink)" fontFamily="var(--font-mono)">{total}</text>
        <text x="74" y="86" textAnchor="middle" fontSize="9.5" fill="var(--color-sub)">{centerLabel}</text>
      </svg>
      <div className="space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-[11.5px]">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-ink">{d.label}</span>
            <span className="num ml-auto pl-3 font-semibold text-sub">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= MISC =================
export function useCountUp(target: number, dur = 850) {
  const [v, setV] = useState(0);
  const ref = useRef(target);
  useEffect(() => {
    ref.current = target;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setV(Math.round(ref.current * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

export function Kpi({ label, value, prefix = "", suffix = "", sub, spark, tone, onClick }: {
  label: string; value: number; prefix?: string; suffix?: string; sub?: ReactNode; spark?: number[]; tone?: string; onClick?: () => void;
}) {
  const v = useCountUp(value);
  return (
    <button onClick={onClick} className={`focus-ring group flex w-full flex-col gap-1 rounded-xl border border-line bg-surface p-4 text-left shadow-[0_1px_2px_rgba(31,42,37,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md ${onClick ? "cursor-pointer" : "cursor-default"}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-sub">{label}</span>
      <span className="flex items-end justify-between gap-2">
        <span className="num display text-[22px] font-bold leading-none" style={tone ? { color: tone } : undefined}>{prefix}{v.toLocaleString()}{suffix}</span>
        {spark && <Spark values={spark} tone={tone ?? "var(--color-accent)"} />}
      </span>
      {sub && <span className="mt-1 text-[11.5px] text-sub">{sub}</span>}
    </button>
  );
}

export function QRBox({ seed, size = 76 }: { seed: string; size?: number }) {
  const n = 13;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  let x = h;
  for (let i = 0; i < n * n; i++) { x = (x * 1103515245 + 12345) >>> 0; cells.push((x >>> 16) % 3 !== 0); }
  const c = size / n;
  const corner = (cx: number, cy: number) => (
    <g key={`${cx}-${cy}`}>
      <rect x={cx * c} y={cy * c} width={c * 3.4} height={c * 3.4} fill="none" stroke="var(--color-ink)" strokeWidth={c * 0.75} />
      <rect x={(cx + 1.1) * c} y={(cy + 1.1) * c} width={c * 1.3} height={c * 1.3} fill="var(--color-ink)" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded bg-white p-1">
      {cells.map((on, i) => {
        const cx = i % n, cy = Math.floor(i / n);
        const inFinder = (cx < 4.2 && cy < 4.2) || (cx > n - 5 && cy < 4.2) || (cx < 4.2 && cy > n - 5);
        return on && !inFinder ? <rect key={i} x={cx * c + 0.4} y={cy * c + 0.4} width={c - 0.8} height={c - 0.8} fill="var(--color-ink)" /> : null;
      })}
      {corner(0.4, 0.4)}{corner(n - 3.8, 0.4)}{corner(0.4, n - 3.8)}
    </svg>
  );
}

export function Barcode({ seed, w = 130, h = 30 }: { seed: string; w?: number; h?: number }) {
  let x = 7;
  for (let i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < 24; i++) { x = (x * 1103515245 + 12345) >>> 0; bars.push(((x >>> 16) % 3) + 1); }
  let off = 4;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {bars.map((bw, i) => {
        const r = <rect key={i} x={off} y={0} width={bw * 1.6} height={h - 6} fill={i % 2 === 0 ? "var(--color-ink)" : "transparent"} />;
        off += bw * 1.6 + 1.7;
        return r;
      })}
      <text x={w / 2} y={h - 0.5} textAnchor="middle" fontSize="6.5" fontFamily="var(--font-mono)" fill="var(--color-ink)">{seed}</text>
    </svg>
  );
}

export function PageHead({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="anim-up mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="display text-[21px] font-bold text-ink">{title}</h1>
        {sub && <p className="mt-0.5 text-[12.5px] text-sub">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
