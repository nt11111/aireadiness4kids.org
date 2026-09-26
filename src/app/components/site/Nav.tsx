import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowRight, ChevronDown, Check } from "lucide-react";
import { Logo } from "./Logo";
import { buttonVariants } from "../ui/button";
import { switchLearner } from "../../lib/post";
import { cn } from "../ui/utils";

type Item = { label: string; href: string; desc?: string };
type Group = { label: string; href: string; items?: Item[] };

export const NAV: Group[] = [
  { label: "Courses", href: "/courses" },
  {
    label: "Our Work",
    href: "/programs",
    items: [
      { label: "Programs & workshops", href: "/programs", desc: "Workshops, parent nights, teacher PD" },
      { label: "Student Ambassadors", href: "/get-involved#ambassadors", desc: "Teens leading at their schools" },
      { label: "Research & Reports", href: "/programs#research", desc: "What we learn along the way" },
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
      { label: "How modules are reviewed", href: "/about#reviewers", desc: "Draft, in review, and reviewed" },
      { label: "Leadership & Team", href: "/about#team", desc: "How ARK is organized" },
      { label: "Contact", href: "/contact", desc: "Questions, workshops, partnerships" },
    ],
  },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function Nav({ pathname }: { pathname: string }) {
  const path = pathname.replace(/\/$/, "") || "/";
  const [open, setOpen] = useState(false);
  const [dd, setDd] = useState<string | null>(null);
  const toggles = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuBtn = useRef<HTMLButtonElement>(null);
  const me = useSignedIn();

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

  // A group is "current" on its own page, anywhere under it (/courses/...), or on one of its items' pages (ignoring #anchors).
  const isActive = (g: Group) =>
    path === g.href || path.startsWith(`${g.href}/`) || (g.items ?? []).some((i) => !i.href.includes("#") && i.href === path);

  const link = (active: boolean) =>
    cn("rounded-full px-3.5 py-2 text-[0.9375rem] font-bold transition-colors duration-[var(--dur)]", active ? "text-brand" : "text-ink-soft hover:text-ink");

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface/95 shadow-1 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[calc(var(--container)+3rem)] items-center justify-between gap-6 px-4 sm:px-6">
        <a href="/" aria-label="ARK AIReadiness4Kids, home" className="rounded-md">
          <Logo />
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
                  <div className={cn("flex items-center rounded-full", active && "bg-brand-soft")}>
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
                        className="mr-1 grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
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

        <div className="hidden items-center gap-1 lg:flex">
          {/* Donate is also in the footer and the phone menu; it joins the header where there's room. */}
          <a href="/donate" aria-current={path === "/donate" ? "page" : undefined} className={cn(link(path === "/donate"), "hidden xl:inline-flex")}>Donate</a>
          {me ? (
            <div data-nav-group className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDd((d) => (d === "account" ? null : d)); }}>
              <button
                ref={(el) => { toggles.current.account = el; }}
                type="button"
                aria-expanded={dd === "account"}
                aria-controls="nav-account"
                onClick={() => setDd(dd === "account" ? null : "account")}
                className="flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-3 font-bold text-ink transition-colors hover:bg-surface-2"
              >
                <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-brand-soft font-display text-title text-brand">{me.displayName.slice(0, 1).toUpperCase()}</span>
                <span className="max-w-[10rem] truncate text-[0.9375rem]"><span className="sr-only">Account menu for </span>{me.displayName}</span>
                <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-[var(--dur)]", dd === "account" && "rotate-180")} />
              </button>
              <div id="nav-account" hidden={dd !== "account"} className="absolute right-0 top-full pt-2">
                <ul className="w-60 rounded-lg border border-line bg-surface p-2 shadow-2">
                  {me.learners && me.learners.length > 1 && (
                    <>
                      <li aria-hidden="true" className="px-4 pb-1 pt-2 text-small font-bold uppercase tracking-[0.12em] text-ink-soft">Learning as</li>
                      {me.learners.map((l) => (
                        <li key={l.id}>
                          <button type="button" aria-pressed={l.id === me.learnerId} onClick={() => void switchLearner(l.id)} className="flex w-full items-center justify-between gap-2 rounded-md px-4 py-3 text-left text-ui font-bold text-ink transition-colors hover:bg-surface-2 hover:text-brand">
                            <span><span className="sr-only">Learning as </span>{l.nickname}</span>
                            {l.id === me.learnerId && <Check aria-hidden="true" className="size-4 text-brand" />}
                          </button>
                        </li>
                      ))}
                      <li aria-hidden="true" className="mx-2 my-1 border-t border-line" />
                    </>
                  )}
                  {accountLinks(me).map(([label, href]) => (
                    <li key={href}><a href={href} className="block rounded-md px-4 py-3 text-ui font-bold text-ink transition-colors hover:bg-surface-2 hover:text-brand">{label}</a></li>
                  ))}
                  <li><button type="button" onClick={signOut} className="block w-full rounded-md px-4 py-3 text-left text-ui font-bold text-ink transition-colors hover:bg-surface-2 hover:text-brand">Sign out</button></li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <a href="/signin" aria-current={path === "/signin" ? "page" : undefined} className={link(path === "/signin")}>Sign in</a>
              <a href="/signup" className={buttonVariants()}>Create free account</a>
            </>
          )}
        </div>

        <button
          ref={menuBtn}
          type="button"
          className="grid size-11 place-items-center rounded-full text-ink hover:bg-surface-2 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
        </button>
      </div>

      <div id="mobile-menu" hidden={!open} className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto bg-surface px-4 py-6 sm:px-6 lg:hidden">
        <nav aria-label="Main">
          <ul>
            {NAV.map((g) => (
              <li key={g.label} className="border-b border-line py-3">
                <a href={g.href} aria-current={path === g.href ? "page" : undefined} className={cn("block py-1 font-display text-2xl font-semibold", isActive(g) ? "text-brand" : "text-ink")}>{g.label}</a>
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
          {me ? (
            <>
              <p className="text-small font-bold uppercase tracking-[0.12em] text-ink-soft">Signed in as {me.displayName}</p>
              {me.learners && me.learners.length > 1 && (
                <div role="group" aria-label="Learning as" className="flex flex-wrap gap-2">
                  {me.learners.map((l) => (
                    <button key={l.id} type="button" aria-pressed={l.id === me.learnerId} onClick={() => void switchLearner(l.id)} className={buttonVariants({ variant: l.id === me.learnerId ? "secondary" : "outline" })}>
                      {l.id === me.learnerId && <Check aria-hidden="true" />}<span className="sr-only">Learning as </span>{l.nickname}
                    </button>
                  ))}
                </div>
              )}
              {accountLinks(me).map(([label, href]) => (
                <a key={href} href={href} className={buttonVariants({ variant: "outline", size: "lg" })}>{label}</a>
              ))}
              <button type="button" onClick={signOut} className={buttonVariants({ variant: "ghost", size: "lg" })}>Sign out</button>
            </>
          ) : (
            <>
              <a href="/signup" className={buttonVariants({ size: "lg" })}>Create free account <ArrowRight aria-hidden="true" /></a>
              <a href="/signin" className={buttonVariants({ variant: "outline", size: "lg" })}>Sign in</a>
            </>
          )}
          <a href="/donate" className={buttonVariants({ variant: "ghost", size: "lg" })}>Donate</a>
        </div>
      </div>
    </header>
  );
}

type Me = { displayName: string; accountType: string; role: string | null; learnerId?: string | null; learners?: { id: string; nickname: string }[] };

function accountLinks(me: Me): [string, string][] {
  const links: [string, string][] = [["My learning", "/my-learning"], ["Account", "/account"]];
  if (me.role === "admin") links.push(["Admin", "/admin"]);
  return links;
}

/**
 * Who's signed in, for the header. The session cookie is httpOnly, so pages ask /api/me, but only
 * when the non-secret "ark_si" hint cookie says there may be a session. Signed-out visitors cost nothing.
 */
function useSignedIn(): Me | null {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    if (!/(?:^|;\s*)ark_si=1/.test(document.cookie)) return;
    let live = true;
    fetch("/api/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!live) return;
        if (data?.signedIn) setMe({ displayName: data.displayName, accountType: data.accountType, role: data.role ?? null, learnerId: data.learnerId ?? null, learners: data.learners ?? [] });
        else document.cookie = "ark_si=; Max-Age=0; Path=/; Secure; SameSite=Lax";
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  return me;
}

/** Signs out on the server (clears the cookie and revokes sessions), then goes home. */
async function signOut() {
  try {
    await fetch("/api/signout", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" });
  } finally {
    location.assign("/");
  }
}
