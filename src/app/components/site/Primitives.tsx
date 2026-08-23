import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/* ---------- layout ---------- */
export const Section = ({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) => (
  <section id={id} className={`py-24 lg:py-32 px-6 scroll-mt-20 ${className}`}>
    <div className="max-w-7xl mx-auto">{children}</div>
  </section>
);

export const Eyebrow = ({ children, light = false }: { children: ReactNode; light?: boolean }) => (
  <span className={`inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] font-bold ${light ? "text-glow" : "text-accent"}`}>
    <span className={`w-6 h-[2px] rounded ${light ? "bg-glow" : "bg-accent"}`} />
    {children}
  </span>
);

export const H2 = ({ children, light = false, className = "" }: { children: ReactNode; light?: boolean; className?: string }) => (
  <h2 className={`font-display text-4xl lg:text-5xl font-black leading-[1.06] mt-4 ${light ? "text-white" : "text-primary"} ${className}`}>{children}</h2>
);

export const Lead = ({ children, light = false, className = "" }: { children: ReactNode; light?: boolean; className?: string }) => (
  <p className={`text-lg leading-relaxed mt-5 ${light ? "text-white/65" : "text-muted-foreground"} ${className}`}>{children}</p>
);

export const SectionHead = ({ eyebrow, title, lead, light = false, center = false }: { eyebrow: string; title: ReactNode; lead?: ReactNode; light?: boolean; center?: boolean }) => (
  <div className={`mb-14 reveal ${center ? "text-center max-w-3xl mx-auto" : "max-w-2xl"}`}>
    <Eyebrow light={light}>{eyebrow}</Eyebrow>
    <H2 light={light}>{title}</H2>
    {lead && <Lead light={light}>{lead}</Lead>}
  </div>
);

/* ---------- buttons ---------- */
type BtnProps = { to: string; children: ReactNode; variant?: "accent" | "primary" | "ghost" | "ghost-dark" | "white"; size?: "md" | "lg"; arrow?: boolean; className?: string };
export const Btn = ({ to, children, variant = "accent", size = "md", arrow = false, className = "" }: BtnProps) => {
  const base = "sheen inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 hover:scale-[1.04] active:scale-95";
  const sz = size === "lg" ? "px-8 py-4 text-[15px]" : "px-6 py-3 text-sm";
  const v = {
    accent: "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/25",
    primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
    white: "bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10",
    ghost: "border-[1.5px] border-primary/20 text-primary hover:border-primary hover:bg-primary/5",
    "ghost-dark": "border-[1.5px] border-white/30 text-white hover:bg-white/10 hover:border-white/50",
  }[variant];
  const external = to.startsWith("http") || to.startsWith("mailto:");
  const cls = `${base} ${sz} ${v} ${className}`;
  return external ? <a href={to} className={cls}>{children}{arrow && <ArrowRight size={16} />}</a> : <Link to={to} className={cls}>{children}{arrow && <ArrowRight size={16} />}</Link>;
};

/* ---------- card ---------- */
export const Card = ({ children, className = "", hover = true }: { children: ReactNode; className?: string; hover?: boolean }) => (
  <div className={`bg-card rounded-2xl border border-border p-8 ${hover ? "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(13,31,51,.12)] hover:border-accent/30" : ""} ${className}`}>{children}</div>
);

export const IconBox = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 text-accent grid place-items-center mb-5 ${className}`}>{children}</div>
);

/* ---------- CTA band ---------- */
export const CTABand = ({ title, lead, primary, secondary }: { title: ReactNode; lead: ReactNode; primary: { label: string; to: string }; secondary?: { label: string; to: string } }) => (
  <section className="px-6 py-12">
    <div className="relative max-w-7xl mx-auto rounded-[32px] bg-primary overflow-hidden px-8 py-16 lg:px-16 lg:py-20 reveal">
      <div className="absolute inset-0 circuit-grid opacity-[0.06]" />
      <div className="absolute -top-32 -right-20 w-[480px] h-[480px] rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <img src="/brand/ark-mark-web.png" alt="" aria-hidden className="absolute right-6 -bottom-10 w-56 opacity-[0.14] pointer-events-none select-none hidden md:block" />
      <div className="relative max-w-2xl">
        <h2 className="font-display text-4xl lg:text-5xl font-black text-white leading-[1.06]">{title}</h2>
        <p className="text-white/65 text-lg leading-relaxed mt-5 max-w-xl">{lead}</p>
        <div className="flex flex-wrap gap-4 mt-9">
          <Btn to={primary.to} size="lg" arrow>{primary.label}</Btn>
          {secondary && <Btn to={secondary.to} size="lg" variant="ghost-dark">{secondary.label}</Btn>}
        </div>
      </div>
    </div>
  </section>
);
