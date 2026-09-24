import { ArrowRight, CheckCircle2, BookOpen, Users, Home as HomeIcon, Star, GraduationCap, Trophy, ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";
import { ORG, TRUST, IMPACT, TRACKS, PROGRAMS } from "../lib/content";
import { trackStyle } from "../lib/tracks";
import { Section, Eyebrow, H2, Lead, SectionHead, Btn, Card, IconBox, CTABand } from "../components/site/Primitives";
import { Counter } from "../components/site/Counter";
import { cn } from "../components/ui/utils";

const programIcons = { curriculum: BookOpen, workshops: Users, parents: HomeIcon, ambassadors: Star, pd: GraduationCap, summit: Trophy } as const;

export function HomeHero() {
  return (
    <section className="on-dark relative min-h-[92vh] bg-ink overflow-hidden flex items-center">
      <div className="absolute inset-0 circuit-grid opacity-[0.04]" />
      <div className="absolute top-1/4 right-1/4 w-[560px] h-[560px] bg-brand/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/5 w-96 h-96 bg-glow/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 grid lg:grid-cols-[1.1fr_.9fr] gap-16 items-center w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2.5 bg-white/[0.08] border border-white/15 rounded-full px-4 py-2 mb-8 ark-rise">
            <span className="w-2 h-2 rounded-full bg-glow ark-ping shrink-0" />
            <span className="text-white/80 text-xs font-mono uppercase tracking-[0.18em]">{ORG.tagline}</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.6rem] font-black text-white leading-[1.02] mb-7 ark-rise" style={{ animationDelay: ".08s" }}>
            We're ARK.<br />
            Raising a generation that thinks <em className="not-italic text-glow">with</em> AI.
          </h1>

          <p className="text-white/75 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl ark-rise" style={{ animationDelay: ".16s" }}>
            A nonprofit helping K-12 students, teachers, and parents use artificial intelligence responsibly, safely, and thoughtfully. Free curriculum, in-school workshops, and a student-led ambassador program.
          </p>

          <div className="flex flex-wrap gap-4 ark-rise" style={{ animationDelay: ".24s" }}>
            <Btn to="/curriculum" size="lg" arrow>Explore the Curriculum</Btn>
            <Btn to="/get-involved" size="lg" variant="ghost-dark">Bring ARK to Your School</Btn>
          </div>

          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-10 ark-rise" style={{ animationDelay: ".32s" }}>
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-white/75 text-sm">
                <CheckCircle2 size={15} aria-hidden="true" className="text-glow shrink-0" /> <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mascot stage */}
        <div className="hidden lg:flex justify-center items-center ark-rise" style={{ animationDelay: ".2s" }}>
          <div className="relative w-[420px] h-[420px] grid place-items-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-glow/30 ark-spin-slow" />
            <div className="absolute inset-8 rounded-full border border-white/10 ark-spin-slower" />
            <div className="absolute inset-[14%] rounded-[38%] bg-white/[0.06] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,.35)]" />
            <img src="/brand/ark-mark-web.png" alt="ARK circuit elephant mascot" width={269} height={207} className="relative w-[64%] h-auto ark-float drop-shadow-[0_20px_40px_rgba(0,0,0,.45)]" />
            <span className="absolute top-[18%] left-[14%] w-2.5 h-2.5 rounded-full bg-glow shadow-[0_0_16px_var(--glow)]" />
            <span className="absolute bottom-[22%] right-[12%] w-2 h-2 rounded-full bg-glow shadow-[0_0_14px_var(--glow)]" />
            <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-mono font-bold px-3 py-1.5 rounded-lg shadow-lg">K-12 Ready</div>
            <div className="absolute -bottom-2 -left-2 bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-mono px-3 py-1.5 rounded-lg">100% Free</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Island: counts up the figures when they scroll into view. */
export function ImpactBar() {
  return (
    <section className="bg-accent relative overflow-hidden" aria-label="ARK at a glance">
      <div className="absolute inset-0 circuit-grid opacity-[0.1]" />
      <ul className="relative max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x divide-ink/15">
        {IMPACT.map((s) => (
          <li key={s.label} className="text-center px-4">
            <div className="font-display text-4xl lg:text-5xl font-black text-ink"><Counter value={s.value} suffix={s.suffix} /></div>
            <div className="text-ink text-[11px] font-mono font-bold uppercase tracking-[0.18em] mt-2">{s.label}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const MISSION_QA = [
  { q: "Why does this matter?", a: "Kids are already using AI every day, in homework help, recommendation feeds, voice assistants, and image generators. Almost none of them have been taught how it works, where it fails, or how it uses their data. That gap is a safety issue and an equity issue." },
  { q: "Who is leading this?", a: "A founder-led team backed by a board of educators, technologists, and child-development experts, plus an advisory council of AI researchers, principals, curriculum designers, and parents. Student Ambassadors in grades 9-12 lead workshops at their own schools." },
  { q: "What makes our approach different?", a: "We teach the \"how\" and the \"why,\" not just the \"what.\" Every module is reviewed by classroom teachers, grounds AI in human values and real consequences, and is free with no login required, so no child's data is ever collected." },
  { q: "What actions are we taking?", a: "A free 17-module K-12 curriculum, in-school workshops from 60 minutes to a full day, bilingual Parent Information Nights, teacher professional development, an annual student summit, and a research and impact report each year." },
];

export function HomeBody() {
  return (
    <>
      {/* Mission (Cyber For Youth-style Q&A) */}
      <Section>
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 items-start">
          <div className="lg:sticky lg:top-28 reveal">
            <Eyebrow>Our mission</Eyebrow>
            <H2>Helping kids understand how AI works, not just how to use it.</H2>
            <Lead>{ORG.mission}</Lead>
            <div className="flex items-center gap-3 bg-secondary rounded-xl p-4 border border-border mt-8">
              <ShieldCheck size={20} aria-hidden="true" className="text-brand shrink-0" />
              <span className="text-sm text-foreground/80 leading-snug">No student logins. No data collected from children. Ever.</span>
            </div>
          </div>

          <div className="grid gap-4">
            {MISSION_QA.map((item, i) => (
              <Card key={item.q} className={`reveal d${i + 1}`}>
                <div className="flex gap-5">
                  <span className="font-mono text-xs text-brand pt-1.5 shrink-0 w-7" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-[1.45rem] font-black text-ink mb-2">{item.q}</h3>
                    <p className="text-muted-foreground leading-relaxed text-[15.5px]">{item.a}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Tracks */}
      <Section className="bg-surface border-y border-border">
        <SectionHead eyebrow="Curriculum tracks" title="Built for every learner." lead="Three grade-banded tracks that grow with students, from curious users to confident architects. Standalone modules you can teach in any order." />
        <div className="grid md:grid-cols-3 gap-6">
          {TRACKS.map((t, i) => {
            const s = trackStyle(t.id);
            return (
              <a key={t.id} href={`/curriculum#${t.id}`} className={`group relative bg-card rounded-2xl border border-border overflow-hidden shadow-1 hover:shadow-2 transition-[transform,box-shadow] duration-[var(--dur-slow)] ease-out hover:-translate-y-1.5 reveal d${i + 1}`}>
                <div className={cn("h-1.5", s.bar)} />
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <span className={cn("font-mono text-xs font-bold px-3 py-1.5 rounded-full", s.chip)}>{t.short}</span>
                    <span className="text-muted-foreground font-mono text-xs">{t.modules} modules</span>
                  </div>
                  <h3 className="font-display text-2xl font-black text-ink mb-1">{t.label}</h3>
                  <p className={cn("text-sm font-mono mb-5 font-bold", s.ink)}>{t.grades}</p>
                  <p className="text-foreground/75 leading-relaxed mb-7 text-[15px]">{t.blurb}</p>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-brand group-hover:gap-3 transition-[gap] duration-[var(--dur)]">
                    <span>{t.focus}</span><ArrowRight size={15} aria-hidden="true" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </Section>

      {/* Programs */}
      <section className="on-dark bg-ink py-24 lg:py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 circuit-grid opacity-[0.04]" />
        <div className="relative max-w-7xl mx-auto">
          <SectionHead light eyebrow="Our programs" title={<>Meeting schools<br />where they are.</>} lead="Six ways we reach kids, families, and educators. All of it free to students and schools." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROGRAMS.map((p, i) => {
              const Icon = programIcons[p.key as keyof typeof programIcons];
              return (
                <a key={p.key} href={p.to} className={`group bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/[0.08] hover:border-glow/40 transition-colors duration-[var(--dur-slow)] reveal d${(i % 3) + 1}`}>
                  <div className="w-11 h-11 rounded-xl bg-brand/30 border border-brand/50 flex items-center justify-center mb-5 group-hover:bg-brand/45 transition-colors">
                    <Icon size={18} aria-hidden="true" className="text-glow" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-white/75 text-sm leading-relaxed">{p.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-glow text-sm font-semibold mt-5 group-hover:gap-3 transition-[gap]">Learn more <ArrowRight size={14} aria-hidden="true" /></span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interested in creating change? */}
      <Section className="bg-surface border-y border-border">
        <SectionHead center eyebrow="Get involved" title="Interested in creating change?" lead="There is a role for everyone. Pick the path that fits you." />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl border border-border bg-secondary p-10 overflow-hidden reveal d1">
            <IconBox className="bg-surface border-line"><HeartHandshake size={22} aria-hidden="true" /></IconBox>
            <h3 className="font-display text-3xl font-black text-ink">Parents and Teachers</h3>
            <p className="text-ink-soft leading-relaxed mt-3 mb-8">Download the free curriculum, host a Parent Information Night, get certified through teacher PD, or join our mailing list to stay in the loop.</p>
            <div className="flex flex-wrap gap-3">
              <Btn to="/curriculum" arrow>Get the Curriculum</Btn>
              <Btn to="/contact#newsletter" variant="ghost">Join Our Community</Btn>
            </div>
          </div>
          <div className="on-dark relative rounded-3xl bg-ink p-10 overflow-hidden reveal d2">
            <div className="absolute inset-0 circuit-grid opacity-[0.05]" />
            <div className="relative">
              <IconBox className="bg-white/10 border-white/15 text-glow"><Sparkles size={22} aria-hidden="true" /></IconBox>
              <h3 className="font-display text-3xl font-black text-white">Students</h3>
              <p className="text-white/75 leading-relaxed mt-3 mb-8">In grades 9-12? Become a Student Ambassador. Get certified in one day, lead a workshop at your school each semester, and earn recognition and co-authorship credit.</p>
              <div className="flex flex-wrap gap-3">
                <Btn to="/get-involved#ambassadors" arrow>Apply Now</Btn>
                <Btn to="/get-involved#volunteer" variant="ghost-dark">Volunteer</Btn>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Donate */}
      <CTABand
        title={<>Keep AI literacy free<br />for every kid.</>}
        lead="Every resource is free. Every lesson is teacher-reviewed. Your gift funds curriculum development, free workshops, and facilitator training in the communities that need it most."
        primary={{ label: "Donate", to: "/donate" }}
        secondary={{ label: "Partner With Us", to: "/get-involved#partners" }}
      />
    </>
  );
}
