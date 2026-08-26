import React, { useEffect, useId, useRef, useState } from "react";

/* ================= icons ================= */
const P: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  bell: <><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  chevR: <path d="m9 6 6 6-6 6" />,
  chevL: <path d="m15 6-6 6 6 6" />,
  arrowR: <path d="M4 12h16m-6-6 6 6-6 6" />,
  print: <><path d="M6 9V3h12v6" /><path d="M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="7" /></>,
  download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.7-3.4 3.3-5 6.5-5s5.8 1.6 6.5 5" /><path d="M16 5a3.5 3.5 0 0 1 0 7m2 8c-.3-1.6-1-2.9-2-3.8" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.5 3.6-5.2 7-5.2s6.2 1.7 7 5.2" /></>,
  cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M5.5 9.5h.01M18.5 14.5h.01" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M20 17v4H6.5A2.5 2.5 0 0 1 4 18.5" /></>,
  bus: <><path d="M4 17V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11" /><path d="M4 11h16M4 17h16" /><path d="M7 17v2.5M17 17v2.5" /><path d="M8 14h.01M16 14h.01" /></>,
  cal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M7 15v-4M12 15V7M17 15v-6" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2z" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.2 2" /></>,
  phone: <path d="M5 4h4l1.5 4.5-2.2 1.6a12 12 0 0 0 5.6 5.6l1.6-2.2L20 15v4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 6.2 2 2 0 0 1 5 4z" />,
  doc: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M9 13h6M9 17h6" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  alert: <><path d="M12 3 2.5 20h19z" /><path d="M12 10v4M12 17h.01" /></>,
  send: <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>,
  building: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" /></>,
  cap: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 9v5" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" /></>,
  shield: <><path d="M12 2 4 5.5V11c0 5 3.4 8.7 8 10.5 4.6-1.8 8-5.5 8-10.5V5.5z" /><path d="m8.8 11.6 2.3 2.3 4.2-4.5" /></>,
  wallet: <><path d="M20 7H5a2 2 0 0 1 0-4h13v4" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1" /><path d="M16.5 13.5h.01" /></>,
  refresh: <><path d="M21 12a9 9 0 1 1-2.6-6.3" /><path d="M21 3v6h-6" /></>,
  eye: <><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="2.8" /></>,
  grid: <><rect x="3" y="3" width="7.5" height="7.5" rx="1" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1" /></>,
  msg: <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12z" />,
  star: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" />,
  filter: <path d="M3 5h18l-7 8v5.5l-4 2V13z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  wa: <><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" /><path d="M9 8.5c0 4 2.5 6.5 6.5 6.5l.8-1.8-2-1.2-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1.2-2z" /></>,
  sms: <><rect x="3" y="4" width="18" height="15" rx="2" /><path d="M8 21l1.5-2h5L16 21M7.5 9.5h9M7.5 13h5" /></>,
  app: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  upload: <><path d="M12 15V3m0 0 4 4m-4-4-4 4" /><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6.5 7 8 20a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17.5 7" /><path d="M10 11v6M14 11v6" /></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14h1M14 20h1M18 18h3v3h-3z" /></>,
};

export function I({ n, size = 18, className = "" }: { n: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden>
      {P[n] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

/* ================= primitives ================= */
export function Btn({
  v = "primary", sz = "md", icon, children, className = "", ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { v?: "primary" | "soft" | "ghost" | "outline" | "danger" | "accent" | "dark"; sz?: "xs" | "sm" | "md"; icon?: string }) {
  const vs: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primarydeep shadow-sm",
    soft: "bg-primarysoft text-primarydeep hover:brightness-97",
    ghost: "text-sub hover:bg-linesoft hover:text-ink",
    outline: "border border-line bg-card text-ink hover:border-primary/50 hover:text-primarydeep",
    danger: "bg-danger text-white hover:brightness-95 shadow-sm",
    accent: "bg-accent text-[#221a05] hover:brightness-95 shadow-sm",
    dark: "bg-side text-sidetext hover:text-white",
  };
  const ss = { xs: "px-2 py-1 text-[11.5px]", sm: "px-2.5 py-1.5 text-xs", md: "px-3.5 py-2 text-[13px]" };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-45 ${vs[v]} ${ss[sz]} ${className}`}
      {...rest}
    >
      {icon && <I n={icon} size={sz === "md" ? 16 : 14} />}
      {children}
    </button>
  );
}

const TONES: Record<string, string> = {
  ok: "bg-oksoft text-ok",
  warn: "bg-warnsoft text-warn",
  danger: "bg-dangersoft text-danger",
  info: "bg-infosoft text-info",
  neutral: "bg-linesoft text-sub",
  accent: "bg-accentsoft text-[#8a5c07]",
  primary: "bg-primarysoft text-primarydeep",
};
export function Badge({ tone = "neutral", children, dot }: { tone?: string; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${TONES[tone] ?? TONES.neutral}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Card({ children, className = "", pad = true }: { children: React.ReactNode; className?: string; pad?: boolean }) {
  return <div className={`rounded-lg border border-line bg-card shadow-[0_1px_2px_rgba(21,39,32,0.05)] ${pad ? "p-4" : ""} ${className}`}>{children}</div>;
}

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[22px] font-extrabold tracking-tight text-ink">{title}</h1>
        {sub && <p className="mt-0.5 text-[13px] text-sub">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ================= overlays ================= */
export function Modal({ open, onClose, title, children, w = "max-w-lg", footer }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; w?: string; footer?: React.ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 p-4 pt-[7vh] anim-fade" onMouseDown={onClose}>
      <div className={`w-full ${w} anim-pop rounded-xl border border-line bg-card shadow-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-linesoft px-5 py-3.5">
          <h3 className="font-display text-[15px] font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-sub transition hover:bg-linesoft hover:text-ink"><I n="x" /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-linesoft px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, w = "max-w-xl" }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; w?: string }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/45 anim-fade" onMouseDown={onClose}>
      <aside className={`absolute right-0 top-0 flex h-full w-full ${w} anim-slideL flex-col border-l border-line bg-paper shadow-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3.5">
          <div className="font-display text-[15px] font-bold text-ink">{title}</div>
          <button onClick={onClose} className="rounded-md p-1 text-sub transition hover:bg-linesoft hover:text-ink"><I n="x" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

export function Confirm({ open, onClose, onYes, title, body, yesLabel = "Yes, continue" }: { open: boolean; onClose: () => void; onYes: () => void; title: string; body: string; yesLabel?: string }) {
  return (
    <Modal open={open} onClose={onClose} title={title} w="max-w-sm"
      footer={<>
        <Btn v="outline" onClick={onClose}>Cancel</Btn>
        <Btn v="danger" icon="alert" onClick={() => { onYes(); onClose(); }}>{yesLabel}</Btn>
      </>}>
      <p className="text-[13.5px] leading-relaxed text-sub">{body}</p>
    </Modal>
  );
}

/* ================= forms ================= */
export function Field({ label, children, hint, err, className = "" }: { label: string; children: React.ReactNode; hint?: string; err?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11.5px] font-semibold uppercase tracking-wide text-sub">{label}</span>
      {children}
      {err ? <span className="mt-1 block text-[11.5px] font-medium text-danger">{err}</span> : hint ? <span className="mt-1 block text-[11.5px] text-sub/80">{hint}</span> : null}
    </label>
  );
}
const inputCls = "w-full rounded-md border border-line bg-card px-3 py-2 text-[13px] text-ink placeholder:text-sub/60 transition focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none";
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-[90px] ${props.className ?? ""}`} />;
}
export function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={`${inputCls} appearance-none bg-[url('image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%235f7166%22%20stroke-width=%222%22><path%20d=%22m6%209%206%206%206-6%22/></svg>')] bg-[right_10px_center] bg-no-repeat pr-8 ${rest.className ?? ""}`}>{children}</select>;
}

export function Seg<T extends string>({ options, value, onChange, size = "md" }: { options: { id: T; label: string; tone?: string }[]; value: T; onChange: (v: T) => void; size?: "sm" | "md" }) {
  return (
    <div className="inline-flex rounded-md border border-line bg-linesoft p-0.5">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={`rounded-[5px] font-semibold transition-all ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"} ${value === o.id ? "bg-card text-ink shadow-sm ring-1 ring-line" : "text-sub hover:text-ink"}`}
          style={value === o.id && o.tone ? { color: o.tone } : undefined}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button onClick={() => onChange(!on)} className="inline-flex items-center gap-2 text-[12.5px] font-medium text-ink">
      <span className={`relative h-[20px] w-[36px] rounded-full transition-colors ${on ? "bg-primary" : "bg-line"}`}>
        <span className={`absolute top-[2px] h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-[2px]"}`} />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}

export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string; icon?: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="mb-4 flex flex-wrap gap-0.5 border-b border-line">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-[13px] font-bold transition ${value === t.id ? "border-primary text-primarydeep" : "border-transparent text-sub hover:text-ink"}`}>
          {t.icon && <I n={t.icon} size={14} />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

const AV_COLORS = ["#0e6b4e", "#1e4e7c", "#8e2f3c", "#0f6e7e", "#a3660a", "#5b5ea6"];
export function Avatar({ name, size = 32, className = "" }: { name: string; size?: number; className?: string }) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-extrabold text-white ${className}`}
      style={{ width: size, height: size, background: AV_COLORS[h % AV_COLORS.length], fontSize: Math.round(size * 0.36) }}>
      {initials}
    </span>
  );
}

export function EmptyState({ icon = "search", title, body, action }: { icon?: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-paper/60 px-6 py-12 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primarysoft text-primarydeep"><I n={icon} size={22} /></span>
      <h4 className="font-display text-[15px] font-bold text-ink">{title}</h4>
      {body && <p className="mt-1 max-w-sm text-[12.5px] text-sub">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Pagination({ page, pages, onPage, total }: { page: number; pages: number; onPage: (p: number) => void; total: number }) {
  return (
    <div className="flex items-center justify-between border-t border-linesoft px-3 py-2.5 text-[12px] text-sub">
      <span className="num">{total} record{total === 1 ? "" : "s"} · page {page}/{Math.max(1, pages)}</span>
      <div className="flex items-center gap-1">
        <Btn v="outline" sz="xs" icon="chevL" disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</Btn>
        <Btn v="outline" sz="xs" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next <I n="chevR" size={13} /></Btn>
      </div>
    </div>
  );
}

export const thCls = "px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-sub whitespace-nowrap";
export const tdCls = "px-3 py-2.5 text-[13px] text-ink whitespace-nowrap";

/* ================= motion & numbers ================= */
export function useCountUp(target: number, dur = 850) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.classList.add("on");
        ob.disconnect();
      }
    }, { threshold: 0.12 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ================= charts (hand-rolled SVG) ================= */
export function Spark({ data, w = 110, h = 34, color = "var(--color-primary)" }: { data: number[]; w?: number; h?: number; color?: string }) {
  const id = useId();
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AreaChart({ labels, values, compare, height = 210, format = (n: number) => String(n), color = "var(--color-primary)" }: { labels: string[]; values: number[]; compare?: number[]; height?: number; format?: (n: number) => string; color?: string }) {
  const id = useId();
  const [hov, setHov] = useState<number | null>(null);
  const W = 560, H = height, padL = 46, padB = 22, padT = 12;
  const all = compare ? [...values, ...compare] : values;
  const max = Math.max(...all) * 1.08;
  const x = (i: number) => padL + (i / (labels.length - 1)) * (W - padL - 8);
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1)},${H - padB} L${x(0)},${H - padB} Z`;
  const gridYs = [0.25, 0.5, 0.75, 1].map((f) => padT + f * (H - padT - padB));
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}
        onMouseMove={(e) => {
          const r = (e.target as SVGElement).closest("svg")!.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const idx = Math.round(((px - padL) / (W - padL - 8)) * (labels.length - 1));
          setHov(idx >= 0 && idx < labels.length ? idx : null);
        }}
        onMouseLeave={() => setHov(null)}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {gridYs.map((gy, i) => (
          <g key={i}>
            <line x1={padL} x2={W - 8} y1={gy} y2={gy} stroke="var(--color-linesoft)" strokeWidth="1" />
            <text x={padL - 8} y={gy + 3.5} textAnchor="end" fontSize="9.5" fill="var(--color-sub)" fontFamily="var(--font-mono)">{format(Math.round(max * (1 - (i + 1) / 4 * 1)))}</text>
          </g>
        ))}
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" className="anim-dash" style={{ ["--dashlen" as string]: 900 }} />
        {compare && (
          <path d={compare.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ")} fill="none" stroke="var(--color-accent)" strokeWidth="1.6" strokeDasharray="5 5" opacity="0.9" />
        )}
        {labels.map((l, i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="var(--color-sub)">{l}</text>
        ))}
        {hov !== null && (
          <g>
            <line x1={x(hov)} x2={x(hov)} y1={padT} y2={H - padB} stroke="var(--color-primary)" strokeOpacity="0.35" strokeWidth="1" />
            <circle cx={x(hov)} cy={y(values[hov])} r="4.5" fill={color} stroke="#fff" strokeWidth="2" />
            {compare && <circle cx={x(hov)} cy={y(compare[hov])} r="3.5" fill="var(--color-accent)" stroke="#fff" strokeWidth="1.5" />}
          </g>
        )}
      </svg>
      {hov !== null && (
        <div className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-md border border-line bg-ink px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg"
          style={{ left: `${(x(hov) / W) * 100}%` }}>
          <span className="opacity-60">{labels[hov]} · </span>
          <span className="num">{format(values[hov])}</span>
          {compare && <span className="num block text-accent">target {format(compare[hov])}</span>}
        </div>
      )}
    </div>
  );
}

export function VBars({ items, height = 170, format = (n: number) => String(n), color = "var(--color-primary)" }: { items: { label: string; v: number; tone?: string }[]; height?: number; format?: (n: number) => string; color?: string }) {
  const max = Math.max(...items.map((i) => i.v)) || 1;
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {items.map((it, i) => (
          <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
            <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10.5px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 num">
              {format(it.v)}
            </div>
            <div className="anim-growy w-full rounded-t-[4px] transition-all duration-200 group-hover:brightness-110"
              style={{ height: `${(it.v / max) * 100}%`, background: it.tone ?? color, animationDelay: `${i * 40}ms`, minHeight: 3 }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2">
        {items.map((it, i) => (
          <div key={i} className="flex-1 text-center text-[10px] font-medium text-sub">{it.label}</div>
        ))}
      </div>
    </div>
  );
}

export function HBar({ label, value, max, tone, right }: { label: string; value: number; max: number; tone?: string; right?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const over = value >= max;
  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="font-medium text-ink">{label}</span>
        <span className="num text-sub">{right ?? `${value}/${max}`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-linesoft">
        <div className="anim-growx h-full rounded-full" style={{ width: `${pct}%`, background: tone ?? (over ? "var(--color-danger)" : pct > 82 ? "var(--color-accent)" : "var(--color-primary)") }} />
      </div>
    </div>
  );
}

export function Donut({ data, size = 150, centerLabel, centerValue }: { data: { label: string; value: number; color: string }[]; size?: number; centerLabel?: string; centerValue?: string }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const R = 42, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--color-linesoft)" strokeWidth="12" />
          {data.map((d, i) => {
            const frac = d.value / total;
            const el = (
              <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={d.color} strokeWidth="12"
                strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-acc * C} strokeLinecap="butt"
                className="transition-all duration-700" />
            );
            acc += frac;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="num font-display text-lg font-extrabold text-ink">{centerValue ?? total}</span>
          {centerLabel && <span className="text-[10px] font-medium text-sub">{centerLabel}</span>}
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-[12px]">
            <span className="flex min-w-0 items-center gap-1.5 text-ink"><span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} />{d.label}</span>
            <span className="num font-semibold text-sub">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Funnel({ stages }: { stages: { label: string; value: number }[] }) {
  const max = stages[0]?.value || 1;
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = Math.max(14, (s.value / max) * 100);
        const conv = i > 0 && stages[i - 1].value > 0 ? Math.round((s.value / stages[i - 1].value) * 100) : null;
        return (
          <div key={i}>
            {conv !== null && <div className="num mb-0.5 pl-1 text-[10px] font-semibold text-sub">↓ {conv}%</div>}
            <div className="flex items-center gap-2">
              <div className="anim-growx relative flex h-9 items-center rounded-md bg-primary px-3 text-white shadow-sm" style={{ width: `${pct}%`, background: `color-mix(in srgb, var(--color-primary) ${100 - i * 14}%, var(--color-side))`, animationDelay: `${i * 90}ms` }}>
                <span className="truncate text-[11.5px] font-semibold">{s.label}</span>
                <span className="num ml-auto pl-2 text-[12px] font-bold">{s.value}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= misc crafted bits ================= */
export function QRSvg({ seed, size = 72 }: { seed: string; size?: number }) {
  const N = 17;
  const cells: boolean[] = [];
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  for (let i = 0; i < N * N; i++) { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; cells.push((h >>> 0) % 100 < 46); }
  const finder = (cx: number, cy: number) => (
    <g key={`${cx}${cy}`}>
      <rect x={cx} y={cy} width={4.4} height={4.4} fill="none" stroke="currentColor" strokeWidth={1} />
      <rect x={cx + 1.4} y={cy + 1.4} width={1.6} height={1.6} fill="currentColor" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} className="text-ink">
      <rect width={N} height={N} fill="#fff" />
      {cells.map((c, i) => {
        const x = i % N, y = Math.floor(i / N);
        if ((x < 5 && y < 5) || (x > N - 6 && y < 5) || (x < 5 && y > N - 6)) return null;
        return c ? <rect key={i} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} fill="currentColor" /> : null;
      })}
      {finder(0.3, 0.3)}{finder(N - 4.7, 0.3)}{finder(0.3, N - 4.7)}
    </svg>
  );
}

export function Barcode({ seed, w = 150, h = 34 }: { seed: string; w?: number; h?: number }) {
  let hsh = 7;
  for (const ch of seed) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < 26; i++) { hsh = (hsh * 1103515245 + 12345) >>> 0; bars.push((hsh % 3) + 1); }
  const total = bars.reduce((a, b) => a + b, 0) + bars.length;
  let x = 0;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${total} 10`} preserveAspectRatio="none" className="text-ink">
      {bars.map((b, i) => {
        const el = <rect key={i} x={x} y="0" width={b} height="10" fill="currentColor" />;
        x += b + 1;
        return el;
      })}
    </svg>
  );
}
