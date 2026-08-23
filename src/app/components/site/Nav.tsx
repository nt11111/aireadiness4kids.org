import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { Brand } from "./Logo";

type Item = { label: string; to: string; desc?: string };
type Group = { label: string; to: string; items?: Item[] };

export const NAV: Group[] = [
  {
    label: "Our Work",
    to: "/curriculum",
    items: [
      { label: "Curriculum", to: "/curriculum", desc: "Free K-12 lessons in three tracks" },
      { label: "Programs", to: "/programs", desc: "Workshops, parent nights, teacher PD" },
      { label: "Student Ambassadors", to: "/get-involved#ambassadors", desc: "Teens leading at their schools" },
      { label: "Research & Reports", to: "/programs#research", desc: "Annual impact findings" },
    ],
  },
  {
    label: "Join Us",
    to: "/get-involved",
    items: [
      { label: "Become an Ambassador", to: "/get-involved#ambassadors", desc: "Grades 9-12" },
      { label: "Volunteer", to: "/get-involved#volunteer", desc: "Give your time" },
      { label: "Partner With Us", to: "/get-involved#partners", desc: "Schools, districts, companies" },
      { label: "Mailing List", to: "/contact#newsletter", desc: "Updates a few times a year" },
    ],
  },
  {
    label: "About",
    to: "/about",
    items: [
      { label: "Who We Are", to: "/about", desc: "Mission, vision, and values" },
      { label: "Leadership & Team", to: "/about#team", desc: "How ARK is organized" },
      { label: "Roadmap", to: "/about#roadmap", desc: "Where we are headed" },
    ],
  },
  { label: "Contact", to: "/contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dd, setDd] = useState<string | null>(null);
  const { pathname } = useLocation();

  // Pages with a dark hero start transparent; all others start solid.
  const darkHero = pathname === "/";
  const solid = scrolled || !darkHero || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); setDd(null); }, [pathname]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  const isActive = (g: Group) => pathname === g.to || (g.items ?? []).some((i) => pathname === i.to.split("#")[0]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid ? "bg-white/85 backdrop-blur-xl border-b border-border shadow-[0_2px_24px_rgba(13,31,51,.06)]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-6">
        <Brand light={!solid} compact />

        {/* Desktop */}
        <nav className="hidden lg:flex items-center gap-1" onMouseLeave={() => setDd(null)}>
          {NAV.map((g) => (
            <div key={g.label} className="relative" onMouseEnter={() => g.items && setDd(g.label)}>
              <NavLink
                to={g.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                  solid
                    ? isActive(g) ? "text-accent bg-accent/10" : "text-primary/75 hover:text-primary hover:bg-primary/5"
                    : isActive(g) ? "text-white bg-white/15" : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {g.label}
                {g.items && <ChevronDown size={14} className={`transition-transform ${dd === g.label ? "rotate-180" : ""}`} />}
              </NavLink>

              {g.items && dd === g.label && (
                <div className="absolute left-0 top-full pt-2 ark-rise">
                  <div className="w-[300px] rounded-2xl bg-white border border-border shadow-[0_24px_60px_rgba(13,31,51,.16)] p-2">
                    {g.items.map((i) => (
                      <Link key={i.label} to={i.to} className="flex flex-col gap-0.5 px-4 py-3 rounded-xl hover:bg-secondary transition-colors group">
                        <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">{i.label}</span>
                        {i.desc && <span className="text-xs text-muted-foreground">{i.desc}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/donate"
            className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${solid ? "text-primary/80 hover:text-primary" : "text-white/85 hover:text-white"}`}
          >
            Donate
          </Link>
          <Link
            to="/curriculum"
            className="sheen flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-accent/90 transition-all duration-200 hover:scale-[1.04] active:scale-95 shadow-lg shadow-accent/25"
          >
            Get the Curriculum <ArrowRight size={14} />
          </Link>
        </div>

        <button
          className={`lg:hidden p-2 rounded-xl ${solid ? "text-primary" : "text-white"}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile */}
      {open && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 bg-white overflow-y-auto px-6 py-6 ark-rise">
          {NAV.map((g) => (
            <div key={g.label} className="border-b border-border py-3">
              <Link to={g.to} className="block font-display text-2xl font-black text-primary py-1">{g.label}</Link>
              {g.items && (
                <div className="grid gap-1 pl-1 pt-1 pb-2">
                  {g.items.map((i) => (
                    <Link key={i.label} to={i.to} className="text-[15px] text-primary/70 hover:text-accent py-1.5">{i.label}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-3 mt-6">
            <Link to="/curriculum" className="flex items-center justify-center gap-2 bg-accent text-white px-6 py-3.5 rounded-full font-bold">
              Get the Curriculum <ArrowRight size={16} />
            </Link>
            <Link to="/donate" className="flex items-center justify-center border border-border text-primary px-6 py-3.5 rounded-full font-bold">Donate</Link>
          </div>
        </div>
      )}
    </header>
  );
}
