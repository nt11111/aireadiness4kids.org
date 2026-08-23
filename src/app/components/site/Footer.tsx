import { Link } from "react-router-dom";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { Brand } from "./Logo";

const cols = [
  { heading: "Our Work", links: [["Curriculum", "/curriculum"], ["Programs", "/programs"], ["Student Ambassadors", "/get-involved#ambassadors"], ["Research & Reports", "/programs#research"]] },
  { heading: "Join Us", links: [["Become an Ambassador", "/get-involved#ambassadors"], ["Volunteer", "/get-involved#volunteer"], ["Partner With Us", "/get-involved#partners"], ["Mailing List", "/contact#newsletter"]] },
  { heading: "Organization", links: [["About", "/about"], ["Leadership", "/about#team"], ["Donate", "/donate"], ["Contact", "/contact"]] },
];

export function Footer() {
  return (
    <footer className="relative bg-primary text-white overflow-hidden">
      <img src="/brand/ark-mark-web.png" alt="" aria-hidden className="absolute -right-10 -bottom-12 w-[340px] opacity-[0.06] pointer-events-none select-none" />
      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid lg:grid-cols-[1.4fr_2fr] gap-12 pb-12 border-b border-white/10">
          <div>
            <Brand light />
            <p className="text-white/55 text-[15px] leading-relaxed mt-5 max-w-sm">
              A 501(c)(3) nonprofit equipping K-12 students, teachers, and parents with the knowledge, skills, and ethical grounding to use AI responsibly.
            </p>
            <div className="flex gap-2.5 mt-6">
              {[
                { Icon: Instagram, label: "Instagram", href: "#" },
                { Icon: Linkedin, label: "LinkedIn", href: "#" },
                { Icon: Mail, label: "Email", href: "mailto:hello@aireadiness4kids.org" },
              ].map(({ Icon, label, href }) => (
                <a key={label} href={href} aria-label={label} className="w-10 h-10 rounded-xl bg-white/6 border border-white/10 grid place-items-center text-white/70 hover:text-white hover:bg-white/12 hover:-translate-y-0.5 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {cols.map((c) => (
              <div key={c.heading}>
                <div className="text-white/40 text-[10px] font-mono uppercase tracking-[0.18em] mb-4">{c.heading}</div>
                {c.links.map(([label, to]) => (
                  <Link key={label} to={to} className="block text-white/65 hover:text-glow text-sm py-1.5 transition-colors">{label}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/35 text-xs font-mono">© {new Date().getFullYear()} ARK · AI Readiness for Kids · 501(c)(3) nonprofit</p>
          <p className="text-glow/70 text-xs font-mono tracking-wider">Think. Prompt. Responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
