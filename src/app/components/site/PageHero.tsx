import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Eyebrow } from "./Primitives";

/** Page header for the organization pages: the same warm band as /educators and the course pages. */
export function PageHero({ crumb, eyebrow, title, lead, actions }: { crumb: string; eyebrow: string; title: ReactNode; lead: ReactNode; actions?: ReactNode }) {
  return (
    <header className="border-b border-line bg-surface-2 px-4 pb-12 pt-28 sm:px-6 lg:pb-16 lg:pt-36">
      <div className="mx-auto max-w-site">
        <nav aria-label="Breadcrumb" className="mb-6 text-small text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li className="flex items-center gap-1.5"><a href="/" className="rounded-sm underline decoration-1 underline-offset-4 hover:decoration-2">Home</a><ChevronRight aria-hidden="true" className="size-3.5 shrink-0" /></li>
            <li><span aria-current="page" className="font-bold text-ink">{crumb}</span></li>
          </ol>
        </nav>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-2 max-w-4xl text-display-md text-ink sm:text-display-lg">{title}</h1>
        <p className="mt-4 max-w-reading text-lesson text-ink-soft">{lead}</p>
        {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </div>
    </header>
  );
}
