import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { buttonVariants } from "../ui/button";
import { cn } from "../ui/utils";

/* ---------- layout ---------- */
export const Section = ({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) => (
  <section id={id} className={cn("py-24 lg:py-32 px-6", className)}>
    <div className="max-w-site mx-auto">{children}</div>
  </section>
);

export const Eyebrow = ({ children, light = false }: { children: ReactNode; light?: boolean }) => (
  <span className={cn("inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] font-bold", light ? "text-glow" : "text-brand")}>
    <span className={cn("w-6 h-[2px] rounded", light ? "bg-glow" : "bg-brand")} />
    {children}
  </span>
);

export const H2 = ({ children, light = false, className = "" }: { children: ReactNode; light?: boolean; className?: string }) => (
  <h2 className={cn("font-display text-4xl lg:text-5xl font-black leading-[1.06] mt-4", light ? "text-white" : "text-ink", className)}>{children}</h2>
);

export const Lead = ({ children, light = false, className = "" }: { children: ReactNode; light?: boolean; className?: string }) => (
  <p className={cn("text-lg leading-relaxed mt-5", light ? "text-white/75" : "text-muted-foreground", className)}>{children}</p>
);

export const SectionHead = ({ eyebrow, title, lead, light = false, center = false }: { eyebrow: string; title: ReactNode; lead?: ReactNode; light?: boolean; center?: boolean }) => (
  <div className={cn("mb-14 reveal", center ? "text-center max-w-3xl mx-auto" : "max-w-2xl")}>
    <Eyebrow light={light}>{eyebrow}</Eyebrow>
    <H2 light={light}>{title}</H2>
    {lead && <Lead light={light}>{lead}</Lead>}
  </div>
);

/* ---------- buttons: links styled by the design-system buttonVariants ---------- */
const btnVariant = { accent: "default", primary: "ink", white: "light", ghost: "outline", "ghost-dark": "outline-light" } as const;
type BtnProps = { to: string; children: ReactNode; variant?: keyof typeof btnVariant; size?: "md" | "lg"; arrow?: boolean; className?: string };
export const Btn = ({ to, children, variant = "accent", size = "md", arrow = false, className = "" }: BtnProps) => (
  <a href={to} className={cn(buttonVariants({ variant: btnVariant[variant], size: size === "lg" ? "lg" : "default" }), className)}>
    {children}
    {arrow && <ArrowRight aria-hidden="true" />}
  </a>
);

/* ---------- card ---------- */
export const Card = ({ children, className = "", hover = true }: { children: ReactNode; className?: string; hover?: boolean }) => (
  <div className={cn("bg-card rounded-2xl border border-border p-8 shadow-1", hover && "transition-[transform,box-shadow,border-color] duration-[var(--dur-slow)] ease-out hover:-translate-y-1 hover:shadow-2 hover:border-brand/30", className)}>{children}</div>
);

export const IconBox = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={cn("w-12 h-12 rounded-xl bg-brand-soft border border-brand/20 text-brand grid place-items-center mb-5", className)}>{children}</div>
);

/* ---------- CTA band ---------- */
export const CTABand = ({ title, lead, primary, secondary }: { title: ReactNode; lead: ReactNode; primary: { label: string; to: string }; secondary?: { label: string; to: string } }) => (
  <section className="px-6 py-12">
    <div className="on-dark relative max-w-site mx-auto rounded-[32px] bg-ink overflow-hidden px-8 py-16 lg:px-16 lg:py-20 reveal">
      <div className="absolute inset-0 circuit-grid opacity-[0.05]" />
      <div className="absolute -top-32 -right-20 w-[480px] h-[480px] rounded-full bg-brand/30 blur-3xl pointer-events-none" />
      <img src="/brand/ark-mark-web.png" alt="" aria-hidden="true" className="absolute right-6 -bottom-10 w-56 opacity-[0.14] pointer-events-none select-none hidden md:block" />
      <div className="relative max-w-2xl">
        <h2 className="font-display text-4xl lg:text-5xl font-black text-white leading-[1.06]">{title}</h2>
        <p className="text-white/75 text-lg leading-relaxed mt-5 max-w-xl">{lead}</p>
        <div className="flex flex-wrap gap-4 mt-9">
          <Btn to={primary.to} size="lg" arrow>{primary.label}</Btn>
          {secondary && <Btn to={secondary.to} size="lg" variant="ghost-dark">{secondary.label}</Btn>}
        </div>
      </div>
    </div>
  </section>
);
