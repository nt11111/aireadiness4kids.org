import { Logo } from "./Logo";
import { AMBASSADOR_HREF } from "./Nav";
import { ORG } from "../../lib/content";

const cols = [
  { heading: "Learn", links: [["AI Aware (K-5)", "/courses/aware"], ["AI Literate (6-8)", "/courses/literate"], ["AI Fluent (9-12)", "/courses/fluent"], ["All courses", "/courses"]] },
  { heading: "Get involved", links: [["Become an ambassador", AMBASSADOR_HREF], ["Parents", "/parents"], ["Teachers", "/educators"], ["Workshops", "/workshops"], ["Donate", "/donate"]] },
  { heading: "About", links: [["About ARK", "/about"], ["How we check lessons", "/about#reviewers"], ["Contact", "/contact"]] },
];

const legal = [["Privacy", "/privacy"], ["Terms", "/terms"], ["Accessibility", "/accessibility"]];

export function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-surface print:hidden">
      <div className="mx-auto max-w-[calc(var(--container)+3rem)] px-4 pb-10 pt-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <a href="/" aria-label="ARK, AI Readiness Kollective, home" className="inline-flex min-h-11 items-center">
              <Logo />
            </a>
            <p className="mt-4 max-w-sm text-ui text-ink-soft">
              A 501(c)(3) nonprofit helping K-12 students, teachers, and parents understand AI and use it well. Every course is free.
            </p>
            <a href={`mailto:${ORG.email}`} className="mt-3 inline-block py-2 text-ui font-bold text-brand underline underline-offset-4">{ORG.email}</a>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {cols.map((c) => (
              <nav key={c.heading} aria-label={c.heading}>
                <h2 className="border-t-2 border-ink pt-3 font-display text-small font-bold text-ink">{c.heading}</h2>
                <ul className="mt-2">
                  {c.links.map(([label, href]) => (
                    <li key={label}><a href={href} className="block py-2.5 text-ui text-ink-soft hover:text-ink hover:underline hover:underline-offset-4">{label}</a></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p className="mt-10 max-w-3xl border-l-[6px] border-brand bg-surface-2 px-4 py-3 text-ui text-ink">
          <strong>Our privacy promise:</strong> we collect as little as we can. Kids under 13 never give us an email, reflections stay on your own device, and our analytics use no cookies. <a href="/privacy" className="font-bold text-brand underline underline-offset-4">Read the privacy policy</a>.
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-small text-ink-soft">© {new Date().getFullYear()} ARK · AI Readiness Kollective · 501(c)(3) nonprofit</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5">
              {legal.map(([label, href]) => (
                <li key={href}><a href={href} className="inline-block py-2.5 text-small text-ink-soft underline underline-offset-4 hover:text-ink">{label}</a></li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
