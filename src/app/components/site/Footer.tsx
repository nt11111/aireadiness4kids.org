import { Mail, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { ORG } from "../../lib/content";

const cols = [
  { heading: "Learn", links: [["All courses", "/courses"], ["AI Aware (K-5)", "/courses/aware"], ["AI Literate (6-8)", "/courses/literate"], ["AI Fluent (9-12)", "/courses/fluent"]] },
  { heading: "Our Work", links: [["Workshops & programs", "/workshops"], ["For educators", "/educators"], ["Student Ambassadors", "/get-involved#ambassadors"], ["Research & Reports", "/workshops#research"], ["How we review modules", "/about#reviewers"]] },
  { heading: "Join Us", links: [["Become an Ambassador", "/get-involved#ambassadors"], ["Volunteer", "/get-involved#volunteer"], ["Partner With Us", "/get-involved#partners"], ["Mailing List", "/contact#newsletter"]] },
  { heading: "Organization", links: [["About", "/about"], ["Leadership", "/about#team"], ["Donate", "/donate"], ["Contact", "/contact"]] },
];

const legal = [["Privacy", "/privacy"], ["Terms", "/terms"], ["Accessibility", "/accessibility"]];

export function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-ink text-white print:hidden">
      <div className="relative mx-auto max-w-[calc(var(--container)+3rem)] px-4 pb-10 pt-16 sm:px-6">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.1fr_2.4fr]">
          <div>
            <a href="/" aria-label="ARK AIReadiness4Kids, home" className="inline-block rounded-md">
              <Logo tone="light" />
            </a>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/80">
              A 501(c)(3) nonprofit helping K-12 students, teachers, and parents understand AI and use it responsibly. Every course is free.
            </p>
            <a href={`mailto:${ORG.email}`} className="mt-6 inline-flex items-center gap-2.5 text-[15px] text-white/85 underline decoration-white/40 underline-offset-4 hover:text-glow hover:decoration-glow">
              <Mail aria-hidden="true" className="size-[18px]" /> {ORG.email}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <nav key={c.heading} aria-label={c.heading}>
                <h2 className="mb-4 font-sans text-eyebrow font-bold uppercase tracking-[0.14em] text-white/75">{c.heading}</h2>
                <ul>
                  {c.links.map(([label, href]) => (
                    <li key={label}><a href={href} className="block py-1.5 text-sm text-white/85 transition-colors hover:text-glow">{label}</a></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p className="mt-8 flex max-w-3xl gap-3 text-sm leading-relaxed text-white/85">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-glow" />
          <span><strong className="text-white">Our privacy promise:</strong> we collect as little as we can. Kids under 13 never give us an email, reflections stay on your own device, and our analytics use no cookies. <a href="/privacy" className="text-white underline decoration-white/40 underline-offset-4 hover:text-glow hover:decoration-glow">Read the privacy policy</a>.</span>
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/15 pt-7 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/75">© {new Date().getFullYear()} ARK · AIReadiness4Kids · 501(c)(3) nonprofit</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {legal.map(([label, href]) => (
                <li key={href}><a href={href} className="inline-block py-1.5 text-sm text-white/85 underline decoration-white/40 underline-offset-4 hover:text-glow hover:decoration-glow">{label}</a></li>
              ))}
            </ul>
          </nav>
          <p className="text-xs font-bold tracking-wider text-glow">Think. Prompt. Responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
