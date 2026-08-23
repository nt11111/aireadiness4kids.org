import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Check, Target, Pencil, MessageSquare, FolderOpen, Clock, ClipboardCheck } from "lucide-react";
import { TRACKS } from "../lib/content";
import { PageHero } from "../components/site/PageHero";
import { Section, SectionHead, Btn, Card, IconBox, CTABand } from "../components/site/Primitives";

function Module({ n, t, d, topics, color, open, onToggle }: { n: number; t: string; d: string; topics: string[]; color: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-card border rounded-2xl overflow-hidden transition-all ${open ? "border-accent/40 shadow-[0_12px_40px_rgba(13,31,51,.10)]" : "border-border"}`}>
      <button onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-5 p-6 text-left">
        <span className="w-11 h-11 rounded-xl grid place-items-center font-display font-black text-white shrink-0" style={{ background: color }}>{n}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-display text-[1.15rem] font-bold text-primary">{t}</span>
          <span className="block text-sm text-muted-foreground mt-0.5">{d}</span>
        </span>
        <span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 transition-all ${open ? "bg-accent text-white rotate-180" : "bg-secondary text-accent"}`}><ChevronDown size={16} /></span>
      </button>
      <div className="grid transition-[grid-template-rows] duration-400 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pl-[5.5rem]">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent font-bold mb-3">Key topics covered</div>
            <ul className="grid gap-2">
              {topics.map((tp) => (
                <li key={tp} className="flex gap-2.5 text-[15px] text-foreground/75"><Check size={17} className="text-accent shrink-0 mt-0.5" />{tp}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Curriculum() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const initial = TRACKS.find((t) => "#" + t.id === hash)?.id ?? TRACKS[0].id;
  const [active, setActive] = useState(initial);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => { const h = hash.replace("#", ""); if (TRACKS.some((t) => t.id === h)) { setActive(h); setOpen(0); } }, [hash]);

  const track = TRACKS.find((t) => t.id === active)!;

  const template = [
    { Icon: Target, t: "Learning objectives", d: "Three to five measurable goals for every module." },
    { Icon: Pencil, t: "Main activity", d: "A hands-on exercise that anchors the concept in something kids actually do." },
    { Icon: MessageSquare, t: "Discussion questions", d: "Prompts that surface real opinions in class or small groups." },
    { Icon: FolderOpen, t: "Materials and resources", d: "Handouts, videos, tools, and links in one place." },
    { Icon: Clock, t: "Duration", d: "Piloted timing, 60 to 90 minutes per module." },
    { Icon: ClipboardCheck, t: "Optional assessment", d: "Exit tickets, reflections, quizzes, or projects." },
  ];

  return (
    <>
      <PageHero crumb="Curriculum" eyebrow="The curriculum library" title="A complete K-12 AI literacy curriculum. Free for everyone."
        lead="Three grade-banded tracks, seventeen standalone modules. Teach them in any order or combine them into a half-day or full-day program. No login. No paywall. Updated every year."
        actions={<><Btn to="#tracks" arrow>Browse the tracks</Btn><Btn to="/programs#workshops" variant="ghost">Book a workshop</Btn></>} />

      {/* Promise row */}
      <Section className="!py-16">
        <div className="grid sm:grid-cols-3 gap-5">
          {[["No login", "No account needed to download and use any material."], ["No paywall", "Teachers, parents, and homeschoolers can use it all, anytime."], ["Teacher reviewed", "Every module is tested by a classroom teacher before release."]].map(([h, d], i) => (
            <Card key={h} className={`text-center reveal d${i + 1}`}><div className="font-display text-3xl font-black text-primary">{h}</div><p className="text-muted-foreground mt-2 text-[15px]">{d}</p></Card>
          ))}
        </div>
      </Section>

      {/* Tracks */}
      <Section id="tracks" className="bg-white border-y border-border">
        <SectionHead center eyebrow="Pick a track" title="Choose the right level for your students." />

        <div className="flex flex-wrap justify-center gap-2.5 mb-12" role="tablist">
          {TRACKS.map((t) => (
            <button key={t.id} role="tab" aria-selected={active === t.id} onClick={() => { setActive(t.id); setOpen(0); navigate("#" + t.id, { replace: true }); }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-full border text-sm font-bold transition-all ${active === t.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-card text-primary/70 border-border hover:border-accent hover:text-primary"}`}>
              {t.label} <span className={`font-mono text-xs ${active === t.id ? "text-glow" : "text-muted-foreground"}`}>{t.short}</span>
            </button>
          ))}
        </div>

        <div key={track.id} className="ark-rise">
          <div className="grid lg:grid-cols-[1fr_.9fr] gap-10 items-end mb-10">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent font-bold">Track · {track.grades}</span>
              <h3 className="font-display text-4xl lg:text-5xl font-black text-primary mt-3">{track.label}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mt-4">{track.blurb}</p>
            </div>
            <div className="rounded-2xl p-7 text-white relative overflow-hidden" style={{ background: `linear-gradient(150deg, ${track.color === "#0D1F33" ? "#1C507A" : track.color}, #0D1F33)` }}>
              <div className="absolute inset-0 circuit-grid opacity-[0.08]" />
              <div className="relative">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">Theme</div>
                <div className="font-display text-2xl font-black mt-1">{track.focus}</div>
                <p className="text-white/80 text-sm mt-3">{track.modules} standalone modules · 60 to 90 minutes each.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {track.list.map((m, i) => (
              <Module key={m.t} n={i + 1} t={m.t} d={m.d} topics={m.topics} color={track.color === "#0D1F33" ? "linear-gradient(140deg,#1C507A,#0D1F33)" : `linear-gradient(140deg,${track.color},#1C507A)`} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
            ))}
          </div>
        </div>
      </Section>

      {/* Template */}
      <Section>
        <SectionHead center eyebrow="In every module" title="A consistent template facilitators can trust." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {template.map(({ Icon, t, d }, i) => (
            <Card key={t} className={`reveal d${(i % 3) + 1}`}><IconBox><Icon size={22} /></IconBox><h3 className="font-display text-xl font-bold text-primary mb-2">{t}</h3><p className="text-muted-foreground text-[15px] leading-relaxed">{d}</p></Card>
          ))}
        </div>
      </Section>

      <CTABand title="Bring responsible AI to your classroom." lead="Download the full curriculum free, or invite a certified facilitator to deliver it as a workshop in your school." primary={{ label: "Download the curriculum", to: "/contact" }} secondary={{ label: "Book a workshop", to: "/programs#workshops" }} />
    </>
  );
}
