import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Eyebrow } from "./Primitives";

export function PageHero({ crumb, eyebrow, title, lead, actions }: { crumb: string; eyebrow: string; title: ReactNode; lead: ReactNode; actions?: ReactNode }) {
  return (
    <header className="relative bg-gradient-to-b from-secondary to-background border-b border-border overflow-hidden pt-36 pb-16 px-6">
      <img src="/brand/ark-mark-web.png" alt="" aria-hidden className="absolute right-[4%] top-1/2 -translate-y-1/2 w-[300px] opacity-90 drop-shadow-[0_20px_40px_rgba(13,31,51,.18)] hidden xl:block pointer-events-none select-none ark-float" />
      <div className="relative max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent">Home</Link><ChevronRight size={12} /><span className="text-primary">{crumb}</span>
        </nav>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-primary leading-[1.04] mt-4 max-w-3xl">{title}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mt-6 max-w-2xl">{lead}</p>
        {actions && <div className="flex flex-wrap gap-4 mt-9">{actions}</div>}
      </div>
    </header>
  );
}
