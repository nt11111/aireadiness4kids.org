import { useEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent } from "react";
import { ChevronDown, Check, Target, Pencil, MessageSquare, FolderOpen, Clock, ClipboardCheck, Presentation, ExternalLink } from "lucide-react";
import { TRACKS } from "../lib/content";
import { trackStyle } from "../lib/tracks";
import { PageHero } from "../components/site/PageHero";
import { Section, SectionHead, Btn, Card, IconBox, CTABand } from "../components/site/Primitives";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../components/ui/utils";

// React 18 has no typed `inert` prop; an empty string renders the attribute.
const inertWhen = (on: boolean) => (on ? { inert: "" } : {}) as HTMLAttributes<HTMLDivElement>;

export function CurriculumTop() {
  return (
    <>
      <PageHero crumb="Curriculum" eyebrow="The curriculum library" title="A complete K-12 AI literacy curriculum. Free for everyone."
        lead="Three grade-banded tracks, seventeen standalone modules. Teach them in any order or combine them into a half-day or full-day program. No login. No paywall. Updated every year."
        actions={<><Btn to="#tracks" arrow>Browse the tracks</Btn><Btn to="/programs#workshops" variant="ghost">Book a workshop</Btn></>} />

      <Section className="!py-16">
        <div className="grid sm:grid-cols-3 gap-5">
          {[["No login", "No account needed to download and use any material."], ["No paywall", "Teachers, parents, and homeschoolers can use it all, anytime."], ["Teacher reviewed", "Every module is tested by a classroom teacher before release."]].map(([h, d], i) => (
            <Card key={h} className={`text-center reveal d${i + 1}`}><div className="font-display text-3xl font-black text-ink">{h}</div><p className="text-muted-foreground mt-2 text-[15px]">{d}</p></Card>
          ))}
        </div>
      </Section>
    </>
  );
}

function Module({ id, n, t, d, topics, fill, deck, open, onToggle }: { id: string; n: number; t: string; d: string; topics: string[]; fill: string; deck?: string; open: boolean; onToggle: () => void }) {
  const panel = `${id}-panel`;
  return (
    <div className={cn("bg-card border rounded-2xl overflow-hidden transition-[border-color,box-shadow] duration-[var(--dur-slow)]", open ? "border-brand/40 shadow-2" : "border-border")}>
      <h4>
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panel} className="w-full flex items-center gap-5 p-6 text-left rounded-2xl">
          <span aria-hidden="true" className={cn("w-11 h-11 rounded-xl grid place-items-center font-display font-black shrink-0", fill)}>{n}</span>
          <span className="flex-1 min-w-0">
            <span className="block font-display text-[1.15rem] font-bold text-ink"><span className="sr-only">Module {n}: </span>{t}</span>
            <span className="block text-sm text-muted-foreground mt-0.5 font-sans font-normal">{d}</span>
          </span>
          <span aria-hidden="true" className={cn("w-8 h-8 rounded-full grid place-items-center shrink-0 transition-[transform,background-color] duration-[var(--dur)]", open ? "bg-brand text-white rotate-180" : "bg-secondary text-brand")}><ChevronDown size={16} /></span>
        </button>
      </h4>
      <div id={panel} className="grid transition-[grid-template-rows] duration-[var(--dur-slow)] ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }} {...inertWhen(!open)}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 sm:pl-[5.5rem]">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand font-bold mb-3">Key topics covered</div>
            <ul className="grid gap-2">
              {topics.map((tp) => (
                <li key={tp} className="flex gap-2.5 text-[15px] text-foreground/80"><Check size={17} aria-hidden="true" className="text-brand shrink-0 mt-0.5" />{tp}</li>
              ))}
            </ul>
            {deck && (
              <a href={deck} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
                <Presentation aria-hidden="true" /> View slide deck<span className="sr-only"> for {t} (opens in a new tab)</span> <ExternalLink aria-hidden="true" className="opacity-80" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Island: track tabs (WAI-ARIA tabs pattern) + module accordion. Syncs with #explorers etc. */
export function CurriculumTracks() {
  const [active, setActive] = useState<string>(TRACKS[0].id);
  const [open, setOpen] = useState<number | null>(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      if (TRACKS.some((t) => t.id === h)) { setActive(h); setOpen(0); }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const select = (id: string, focus = false) => {
    setActive(id);
    setOpen(0);
    history.replaceState(null, "", `#${id}`);
    if (focus) tabs.current[TRACKS.findIndex((t) => t.id === id)]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = TRACKS.length - 1;
    const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(TRACKS[next].id, true);
  };

  const track = TRACKS.find((t) => t.id === active)!;
  const s = trackStyle(track.id);

  return (
    <Section id="tracks" className="bg-surface border-y border-border">
      {/* Deep-link targets so /curriculum#explorers scrolls here without JS. */}
      {TRACKS.map((t) => <span key={t.id} id={t.id} className="block" aria-hidden="true" />)}
      <SectionHead center eyebrow="Pick a track" title="Choose the right level for your students." />

      <div className="flex flex-wrap justify-center gap-2.5 mb-12" role="tablist" aria-label="Curriculum tracks">
        {TRACKS.map((t, i) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => { tabs.current[i] = el; }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls="track-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn("flex min-h-11 items-center gap-2.5 px-5 py-3 rounded-full border text-sm font-bold transition-colors duration-[var(--dur)]", selected ? "bg-ink text-white border-ink shadow-1" : "bg-card text-ink-soft border-input hover:border-brand hover:text-ink")}
            >
              {t.label} <span className={cn("font-mono text-xs", selected ? "text-glow" : "text-ink-soft")}>{t.short}</span>
            </button>
          );
        })}
      </div>

      <div key={track.id} id="track-panel" role="tabpanel" aria-labelledby={`tab-${track.id}`} className="ark-rise">
        <div className="grid lg:grid-cols-[1fr_.9fr] gap-10 items-end mb-10">
          <div>
            <span className={cn("font-mono text-xs uppercase tracking-[0.18em] font-bold", s.ink)}>Track · {track.grades}</span>
            <h3 className="font-display text-4xl lg:text-5xl font-black text-ink mt-3">{track.label}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed mt-4">{track.blurb}</p>
          </div>
          <div className={cn("rounded-2xl p-7 relative overflow-hidden shadow-1", s.fill)}>
            <div className="relative">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] font-bold">Theme</div>
              <div className="font-display text-2xl font-black mt-1">{track.focus}</div>
              <p className="text-sm mt-3">{track.modules} standalone modules · 60 to 90 minutes each.</p>
              {track.folder && (
                <a href={track.folder} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "light", size: "sm" }), "mt-5")}>
                  <FolderOpen aria-hidden="true" /> Open all {track.modules} slide decks<span className="sr-only"> (opens in a new tab)</span> <ExternalLink aria-hidden="true" className="opacity-70" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {track.list.map((m, i) => (
            <Module key={m.t} id={`${track.id}-m${i + 1}`} n={i + 1} t={m.t} d={m.d} topics={m.topics} deck={m.deck} fill={s.fill} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </div>
    </Section>
  );
}

const template = [
  { Icon: Target, t: "Learning objectives", d: "Three to five measurable goals for every module." },
  { Icon: Pencil, t: "Main activity", d: "A hands-on exercise that anchors the concept in something kids actually do." },
  { Icon: MessageSquare, t: "Discussion questions", d: "Prompts that surface real opinions in class or small groups." },
  { Icon: FolderOpen, t: "Materials and resources", d: "Handouts, videos, tools, and links in one place." },
  { Icon: Clock, t: "Duration", d: "Piloted timing, 60 to 90 minutes per module." },
  { Icon: ClipboardCheck, t: "Optional assessment", d: "Exit tickets, reflections, quizzes, or projects." },
];

export function CurriculumBottom() {
  return (
    <>
      <Section>
        <SectionHead center eyebrow="In every module" title="A consistent template facilitators can trust." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {template.map(({ Icon, t, d }, i) => (
            <Card key={t} className={`reveal d${(i % 3) + 1}`}><IconBox><Icon size={22} aria-hidden="true" /></IconBox><h3 className="font-display text-xl font-bold text-ink mb-2">{t}</h3><p className="text-muted-foreground text-[15px] leading-relaxed">{d}</p></Card>
          ))}
        </div>
      </Section>

      <CTABand title="Bring responsible AI to your classroom." lead="Download the full curriculum free, or invite a certified facilitator to deliver it as a workshop in your school." primary={{ label: "Download the curriculum", to: "/contact" }} secondary={{ label: "Book a workshop", to: "/programs#workshops" }} />
    </>
  );
}
