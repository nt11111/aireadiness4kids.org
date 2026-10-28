import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { buttonVariants } from "../ui/button";
import { cn } from "../ui/utils";

/* Building blocks for the organization pages (About, Workshops, Get involved, Donate, Contact).
   Same look as the home and course pages: white and cool gray, Archivo headings, square corners,
   content blocks marked by a 2px ink rule instead of boxes and shadows, and one clear action per section. */

/* ---------- layout ---------- */
export const Section = ({ children, className = "", id, tint = false, labelledBy }: { children: ReactNode; className?: string; id?: string; tint?: boolean; labelledBy?: string }) => (
  <section id={id} aria-labelledby={labelledBy} className={cn("px-4 py-16 sm:px-6 lg:py-24", tint && "bg-surface-2", className)}>
    <div className="mx-auto max-w-site">{children}</div>
  </section>
);

export const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={cn("font-display text-small font-bold text-ink-soft", className)}>{children}</p>
);

export const H2 = ({ children, id, className = "" }: { children: ReactNode; id?: string; className?: string }) => (
  <h2 id={id} className={cn("mt-2 text-[clamp(1.625rem,3vw,2.25rem)] leading-tight text-ink", className)}>{children}</h2>
);

export const Lead = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={cn("mt-4 max-w-[36em] text-lesson text-ink-soft", className)}>{children}</p>
);

export const SectionHead = ({ eyebrow, title, lead, id, center = false }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; id?: string; center?: boolean }) => (
  <div className={cn("mb-10", center ? "mx-auto max-w-3xl text-center [&_p]:mx-auto" : "max-w-3xl")}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <H2 id={id}>{title}</H2>
    {lead && <Lead>{lead}</Lead>}
  </div>
);

/* ---------- buttons: links styled by the design-system buttonVariants ---------- */
type BtnProps = { to: string; children: ReactNode; variant?: "primary" | "outline"; size?: "md" | "lg"; arrow?: boolean; className?: string };
export const Btn = ({ to, children, variant = "primary", size = "md", arrow = false, className = "" }: BtnProps) => (
  <a href={to} className={cn(buttonVariants({ variant: variant === "primary" ? "default" : "outline", size: size === "lg" ? "lg" : "default" }), className)}>
    {children}
    {arrow && <ArrowRight aria-hidden="true" />}
  </a>
);

/* ---------- card ---------- */
export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={cn("border-t-2 border-ink pb-2 pt-5", className)}>{children}</div>
);

/** A small icon on a gray square, above a card's heading. */
export const IconBox = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={cn("mb-4 grid size-11 place-items-center bg-surface-2 text-ink [&_svg]:size-5", className)}>{children}</div>
);

/** A card heading (Archivo, title size). */
export const CardTitle = ({ children, as: Tag = "h3", className = "" }: { children: ReactNode; as?: "h2" | "h3" | "h4"; className?: string }) => (
  <Tag className={cn("font-display text-title font-bold text-ink", className)}>{children}</Tag>
);

/* ---------- closing call to action: a gray band under a 2px ink rule ---------- */
export const CTABand = ({ title, lead, primary, secondary }: { title: ReactNode; lead: ReactNode; primary: { label: string; to: string }; secondary?: { label: string; to: string } }) => (
  <section aria-labelledby="cta-h" className="border-t-2 border-ink bg-surface-2 px-4 py-14 sm:px-6 lg:py-20">
    <div className="mx-auto flex max-w-site flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-2xl">
        <h2 id="cta-h" className="text-[clamp(1.625rem,3vw,2.25rem)] leading-tight text-ink">{title}</h2>
        <p className="mt-3 text-lesson text-ink">{lead}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
        <Btn to={primary.to} size="lg">{primary.label}</Btn>
        {secondary && <Btn to={secondary.to} size="lg" variant="outline">{secondary.label}</Btn>}
      </div>
    </div>
  </section>
);

/** A list of short points with a check mark (lucide's Check is passed in so this file stays icon-agnostic). */
export const Ticks = ({ items, icon, className = "" }: { items: string[]; icon: ReactNode; className?: string }) => (
  <ul className={cn("grid gap-2.5", className)}>
    {items.map((x) => (
      <li key={x} className="flex gap-3 text-ui text-ink"><span aria-hidden="true" className="mt-0.5 shrink-0 text-ink [&_svg]:size-[1.125rem]">{icon}</span>{x}</li>
    ))}
  </ul>
);
