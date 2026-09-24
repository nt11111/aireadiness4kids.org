import { Mail } from "lucide-react";
import { Logo } from "./Logo";
import { ORG } from "../../lib/content";

const cols = [
  { heading: "Our Work", links: [["Curriculum", "/curriculum"], ["Programs", "/programs"], ["Student Ambassadors", "/get-involved#ambassadors"], ["Research & Reports", "/programs#research"]] },
  { heading: "Join Us", links: [["Become an Ambassador", "/get-involved#ambassadors"], ["Volunteer", "/get-involved#volunteer"], ["Partner With Us", "/get-involved#partners"], ["Mailing List", "/contact#newsletter"]] },
  { heading: "Organization", links: [["About", "/about"], ["Leadership", "/about#team"], ["Donate", "/donate"], ["Contact", "/contact"]] },
];

export function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-ink text-white">
      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <a href="/" aria-label="ARK AIReadiness4Kids, home" className="inline-block rounded-md">
              <Logo tone="light" />
            </a>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/75">
              A 501(c)(3) nonprofit equipping K-12 students, teachers, and parents with the knowledge, skills, and ethical grounding to use AI responsibly.
            </p>
            <a href={`mailto:${ORG.email}`} className="mt-6 inline-flex items-center gap-2.5 text-[15px] text-white/85 underline decoration-white/40 underline-offset-4 hover:text-glow hover:decoration-glow">
              <Mail aria-hidden="true" className="size-[18px]" /> {ORG.email}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <nav key={c.heading} aria-label={c.heading}>
                <h2 className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">{c.heading}</h2>
                <ul>
                  {c.links.map(([label, href]) => (
                    <li key={label}><a href={href} className="block py-1.5 text-sm text-white/85 transition-colors hover:text-glow">{label}</a></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-7 sm:flex-row">
          <p className="font-mono text-xs text-white/70">© {new Date().getFullYear()} ARK · AIReadiness4Kids · 501(c)(3) nonprofit</p>
          <p className="font-mono text-xs tracking-wider text-glow">Think. Prompt. Responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
