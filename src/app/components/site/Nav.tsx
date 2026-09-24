import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { buttonVariants } from "../ui/button";
import { cn } from "../ui/utils";

type Item = { label: string; href: string; desc?: string };
type Group = { label: string; href: string; items?: Item[] };

export const NAV: Group[] = [
  {
    label: "Our Work",
    href: "/curriculum",
    items: [
      { label: "Curriculum", href: "/curriculum", desc: "Free K-12 lessons in three tracks" },
      { label: "Programs", href: "/programs", desc: "Workshops, parent nights, teacher PD" },
      { label: "Student Ambassadors", href: "/get-involved#ambassadors", desc: "Teens leading at their schools" },
      { label: "Research & Reports", href: "/programs#research", desc: "Annual impact findings" },
    ],
  },
  {
    label: "Join Us",
    href: "/get-involved",
    items: [
      { label: "Become an Ambassador", href: "/get-involved#ambassadors", desc: "Grades 9-12" },
      { label: "Volunteer", href: "/get-involved#volunteer", desc: "Give your time" },
      { label: "Partner With Us", href: "/get-involved#partners", desc: "Schools, districts, companies" },
      { label: "Mailing List", href: "/contact#newsletter", desc: "Updates a few times a year" },
    ],
  },
  {
    label: "About",
    href: "/about",
    items: [
      { label: "Who We Are", href: "/about", desc: "Mission, vision, and values" },
      { label: "Leadership & Team", href: "/about#team", desc: "How ARK is organized" },
      { label: "Roadmap", href: "/about#roadmap", desc: "Where we are headed" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function Nav({ pathname }: { pathname: string }) {
  const path = pathname.replace(/\/$/, "") || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dd, setDd] = useState<string | null>(null);
  const toggles = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Only the home page has a dark hero under a transparent header.
  const solid = scrolled || path !== "/" || open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (dd) { toggles.current[dd]?.focus(); setDd(null); }
      if (open) { setOpen(false); menuBtn.current?.focus(); }
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest("[data-nav-group]")) setDd(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, [dd, open]);

  // A group is "current" when you're on its page or on one of its items' pages (ignoring #anchors).
  const isActive = (g: Group) => path === g.href || (g.items ?? []).some((i) => !i.href.includes("#") && i.href === path);

  const link = (active: boolean) =>
    cn(
      "rounded-full px-3.5 py-2 text-[0.9375rem] font-bold transition-colors duration-[var(--dur)]",
      solid
        ? active ? "text-brand" : "text-ink-soft hover:text-ink"
        : active ? "text-white" : "text-white/90 hover:text-white",
    );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-[var(--dur-slow)]",
        solid ? "border-line bg-surface/95 shadow-1 backdrop-blur-xl" : "on-dark border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-6">
        <a href="/" aria-label="ARK AIReadiness4Kids, home" className="rounded-md">
          <Logo tone={solid ? "dark" : "light"} />
        </a>

        {/* Desktop: WAI disclosure navigation (link + toggle button per group). */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((g) => {
              const id = `nav-${slug(g.label)}`;
              const expanded = dd === g.label;
              const active = isActive(g);
              return (
                <li
                  key={g.label}
                  data-nav-group
                  className="relative"
                  onMouseEnter={() => g.items && setDd(g.label)}
                  onMouseLeave={() => g.items && setDd(null)}
                  onBlur={(e) => { if (g.items && !e.currentTarget.contains(e.relatedTarget as Node | null)) setDd(null); }}
                >
                  <div className={cn("flex items-center rounded-full", active && (solid ? "bg-brand-soft" : "bg-white/15"))}>
                    <a href={g.href} aria-current={path === g.href ? "page" : undefined} className={cn(link(active), g.items && "pr-1")}>
                      {g.label}
                    </a>
                    {g.items && (
                      <button
                        ref={(el) => { toggles.current[g.label] = el; }}
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={id}
                        onClick={() => setDd(expanded ? null : g.label)}
                        className={cn("mr-1 grid size-8 place-items-center rounded-full transition-colors", solid ? "text-ink-soft hover:bg-surface-2 hover:text-ink" : "text-white/90 hover:bg-white/10 hover:text-white")}
                      >
                        <span className="sr-only">{g.label} menu</span>
                        <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-[var(--dur)]", expanded && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  {g.items && (
                    <div id={id} hidden={!expanded} className="absolute left-0 top-full pt-2">
                      <ul className="w-[300px] rounded-lg border border-line bg-surface p-2 shadow-2">
                        {g.items.map((i) => (
                          <li key={i.label}>
                            <a href={i.href} className="group flex flex-col gap-0.5 rounded-md px-4 py-3 transition-colors hover:bg-surface-2">
                              <span className="text-ui font-bold text-ink group-hover:text-brand">{i.label}</span>
                              {i.desc && <span className="text-small text-ink-soft">{i.desc}</span>}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href="/donate" aria-current={path === "/donate" ? "page" : undefined} className={link(path === "/donate")}>Donate</a>
          <a href="/curriculum" className={buttonVariants()}>
            Get the Curriculum <ArrowRight aria-hidden="true" />
          </a>
        </div>

        <button
          ref={menuBtn}
          type="button"
          className={cn("grid size-11 place-items-center rounded-full lg:hidden", solid ? "text-ink hover:bg-surface-2" : "text-white hover:bg-white/10")}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
        </button>
      </div>

      <div id="mobile-menu" hidden={!open} className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto bg-surface px-6 py-6 lg:hidden">
        <nav aria-label="Main">
          <ul>
            {NAV.map((g) => (
              <li key={g.label} className="border-b border-line py-3">
                <a href={g.href} aria-current={path === g.href ? "page" : undefined} className="block py-1 font-display text-2xl font-semibold text-ink">{g.label}</a>
                {g.items && (
                  <ul className="grid gap-1 pb-2 pl-1 pt-1">
                    {g.items.map((i) => (
                      <li key={i.label}><a href={i.href} className="block py-1.5 text-ui text-ink-soft hover:text-brand">{i.label}</a></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 flex flex-col gap-3">
          <a href="/curriculum" className={buttonVariants({ size: "lg" })}>Get the Curriculum <ArrowRight aria-hidden="true" /></a>
          <a href="/donate" className={buttonVariants({ variant: "outline", size: "lg" })}>Donate</a>
        </div>
      </div>
    </header>
  );
}
