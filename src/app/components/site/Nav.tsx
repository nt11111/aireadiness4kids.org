import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Logo } from "./Logo";
import { buttonVariants } from "../ui/button";
import { switchLearner } from "../../lib/post";
import { cn } from "../ui/utils";

type Item = { label: string; href: string };

/** Four top-level pages, no dropdowns: each label matches the page it opens. */
export const NAV: Item[] = [
  { label: "Courses", href: "/courses" },
  { label: "Parents", href: "/parents" },
  { label: "Teachers", href: "/educators" },
  { label: "About", href: "/about" },
];

export const AMBASSADOR_HREF = "/get-involved#ambassadors";

export function Nav({ pathname, initialMe }: { pathname: string; initialMe?: Me | null }) {
  const path = pathname.replace(/\/$/, "") || "/";
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const accountBtn = useRef<HTMLButtonElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const me = useSignedIn(initialMe);
  // Static pages: while the "si" hint says we may be signed in, keep the sign-in link's space but hide it (no flash).
  const pending = initialMe === undefined && !me ? "in-[.si]:invisible" : undefined;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (account) { accountBtn.current?.focus(); setAccount(false); }
      if (open) { setOpen(false); menuBtn.current?.focus(); }
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest("[data-nav-group]")) setAccount(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, [account, open]);

  // An item is "current" on its own page and anywhere under it (/courses/...).
  const isActive = (i: Item) => path === i.href || path.startsWith(`${i.href}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink bg-surface print:hidden">
      <div className="mx-auto flex h-[72px] max-w-[calc(var(--container)+3rem)] items-center justify-between gap-6 px-4 sm:px-6">
        <a href="/" aria-label="ARK, AI Readiness Kollective, home" className="flex min-h-11 items-center">
          <Logo />
        </a>

        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((i) => (
              <li key={i.href}>
                <a
                  href={i.href}
                  aria-current={isActive(i) ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center border-b-[3px] px-3 pt-[3px] font-display text-ui font-bold text-ink transition-colors duration-[var(--dur-fast)]",
                    isActive(i) ? "border-ink" : "border-transparent hover:border-ink",
                  )}
                >
                  {i.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {me ? (
            <div data-nav-group className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setAccount(false); }}>
              <button
                ref={accountBtn}
                type="button"
                aria-expanded={account}
                aria-controls="nav-account"
                onClick={() => setAccount(!account)}
                className="flex min-h-11 items-center gap-2 py-1 pl-1 pr-3 font-display font-bold text-ink transition-colors hover:bg-surface-2"
              >
                <span aria-hidden="true" className="grid size-9 place-items-center bg-ink text-title text-white">{me.displayName.slice(0, 1).toUpperCase()}</span>
                <span className="max-w-[10rem] truncate text-[0.9375rem]"><span className="sr-only">Account menu for </span>{me.displayName}</span>
                <ChevronDown aria-hidden="true" className={cn("size-4 transition-transform duration-[var(--dur)]", account && "rotate-180")} />
              </button>
              <div id="nav-account" hidden={!account} className="absolute right-0 top-full pt-2">
                <ul className="w-60 border-2 border-ink bg-surface">
                  {me.learners && me.learners.length > 1 && (
                    <>
                      <li aria-hidden="true" className="px-4 pb-1 pt-3 font-display text-small font-bold text-ink-soft">Learning as</li>
                      {me.learners.map((l) => (
                        <li key={l.id}>
                          <button type="button" aria-pressed={l.id === me.learnerId} onClick={() => void switchLearner(l.id)} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-ui font-bold text-ink transition-colors hover:bg-surface-2">
                            <span><span className="sr-only">Learning as </span>{l.nickname}</span>
                            {l.id === me.learnerId && <Check aria-hidden="true" className="size-4" />}
                          </button>
                        </li>
                      ))}
                      <li aria-hidden="true" className="border-t border-line" />
                    </>
                  )}
                  {accountLinks(me).map(([label, href]) => (
                    <li key={href}><a href={href} className="block border-b border-line px-4 py-3 text-ui font-bold text-ink transition-colors hover:bg-surface-2">{label}</a></li>
                  ))}
                  <li><button type="button" onClick={signOut} className="block w-full px-4 py-3 text-left text-ui font-bold text-ink transition-colors hover:bg-surface-2">Sign out</button></li>
                </ul>
              </div>
            </div>
          ) : (
            <a href="/signin" aria-current={path === "/signin" ? "page" : undefined} className={cn("flex min-h-11 items-center px-3 font-display text-ui font-bold text-ink hover:underline hover:underline-offset-4", pending)}>Sign in</a>
          )}
          <a href={AMBASSADOR_HREF} className={buttonVariants({ size: "sm" })}>Become an ambassador</a>
        </div>

        <button
          ref={menuBtn}
          type="button"
          className="flex min-h-12 min-w-12 items-center justify-center border border-ink px-3 font-display text-[0.9375rem] font-bold text-ink hover:bg-surface-2 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span aria-hidden="true">{open ? "Close" : "Menu"}</span>
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      <div id="mobile-menu" hidden={!open} className="fixed inset-x-0 bottom-0 top-[73px] overflow-y-auto bg-surface px-4 pb-8 pt-2 sm:px-6 lg:hidden">
        <nav aria-label="Main">
          <ul>
            {NAV.map((i) => (
              <li key={i.href} className="border-b border-line">
                <a href={i.href} aria-current={isActive(i) ? "page" : undefined} className={cn("block py-4 font-display text-[1.625rem] font-bold text-ink", isActive(i) && "underline decoration-[3px] underline-offset-8")}>{i.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 flex flex-col gap-3">
          <a href={AMBASSADOR_HREF} className={buttonVariants({ size: "lg" })}>Become an ambassador</a>
          {me ? (
            <>
              <p className="mt-3 font-display text-small font-bold text-ink-soft">Signed in as {me.displayName}</p>
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
            <a href="/signin" className={cn(buttonVariants({ variant: "outline", size: "lg" }), pending)}>Sign in</a>
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
  if (me.role === "facilitator" || me.role === "admin") links.push(["Presenter mode", "/present"]);
  if (me.role === "admin") links.push(["Admin", "/admin"]);
  return links;
}

/**
 * Who's signed in, for the header. Server-rendered pages pass it in (`initial`: the account, or null
 * for signed out), so the header is right on first paint. Static pages can't know (`undefined`): the
 * session cookie is httpOnly, so they ask /api/me, but only when the non-secret "ark_si" hint cookie
 * says there may be a session. Signed-out visitors cost nothing. Until the answer comes, the pre-paint
 * script (JS_FLAG_SCRIPT) has marked <html> with "si" and the sign-in links stay hidden.
 */
function useSignedIn(initial: Me | null | undefined): Me | null {
  const [me, setMe] = useState<Me | null>(initial ?? null);
  useEffect(() => {
    const done = () => document.documentElement.classList.remove("si");
    if (initial !== undefined || !/(?:^|;\s*)ark_si=1/.test(document.cookie)) return done();
    let live = true;
    fetch("/api/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!live) return;
        if (data?.signedIn) setMe({ displayName: data.displayName, accountType: data.accountType, role: data.role ?? null, learnerId: data.learnerId ?? null, learners: data.learners ?? [] });
        else document.cookie = "ark_si=; Max-Age=0; Path=/; Secure; SameSite=Lax";
      })
      .catch(() => {})
      .finally(() => { if (live) done(); });
    return () => { live = false; };
  }, [initial]);
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
