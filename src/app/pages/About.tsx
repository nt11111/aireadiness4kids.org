import { Target, Eye, Star, Users, Lightbulb, Check } from "lucide-react";
import { ORG, VALUES, ROADMAP, LEADERSHIP, TEAMS } from "../lib/content";
import { PageHero } from "../components/site/PageHero";
import { Section, SectionHead, Card, IconBox, CTABand } from "../components/site/Primitives";

const leadIcons = [Star, Users, Lightbulb];

export default function About() {
  return (
    <>
      <PageHero crumb="About" eyebrow="Who we are" title="A nonprofit built with parents, teachers, and students, not just for them."
        lead="ARK (AI Readiness for Kids) is a 501(c)(3) nonprofit. We believe every child deserves to understand the AI tools shaping their world, and the confidence to use them with intention and integrity." />

      <Section className="!pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="reveal d1 !p-10"><IconBox><Target size={22} /></IconBox><h2 className="font-display text-3xl font-black text-primary">Our mission</h2><p className="text-muted-foreground leading-relaxed mt-3">{ORG.mission}</p></Card>
          <Card className="reveal d2 !p-10"><IconBox><Eye size={22} /></IconBox><h2 className="font-display text-3xl font-black text-primary">Our vision</h2><p className="text-muted-foreground leading-relaxed mt-3">{ORG.vision}</p></Card>
        </div>
      </Section>

      {/* Values */}
      <Section className="bg-white border-y border-border">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          <div className="lg:sticky lg:top-28 reveal">
            <SectionHead eyebrow="What we stand for" title={<>Five values that<br />guide everything.</>} lead="From the way we write curriculum to the partners we choose, every decision runs through these five commitments." />
          </div>
          <div className="flex flex-col divide-y divide-border">
            {VALUES.map((v, i) => (
              <div key={v.word} className={`flex gap-6 py-7 hover:bg-secondary hover:px-5 hover:rounded-xl hover:-mx-5 transition-all duration-200 reveal d${i + 1}`}>
                <span className="font-mono text-xs text-accent pt-1.5 shrink-0 w-7">{String(i + 1).padStart(2, "0")}</span>
                <div><h3 className="font-display text-2xl font-black text-primary mb-1.5">{v.word}</h3><p className="text-muted-foreground leading-relaxed text-[15px]">{v.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Team */}
      <Section id="team">
        <SectionHead center eyebrow="Leadership and team" title="How ARK is organized." lead="A lean, accountable structure that pairs strategic direction with deep classroom expertise." />
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {LEADERSHIP.map((l, i) => { const Icon = leadIcons[i]; return (
            <Card key={l.role} className={`reveal d${i + 1}`}><IconBox><Icon size={22} /></IconBox><h3 className="font-display text-xl font-black text-primary mb-2">{l.role}</h3><p className="text-muted-foreground text-[15px] leading-relaxed">{l.desc}</p></Card>
          ); })}
        </div>
        <h3 className="font-display text-2xl font-black text-primary text-center mb-6 reveal">Core teams</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAMS.map((t, i) => (
            <div key={t.name} className={`bg-secondary border border-border rounded-2xl p-6 reveal d${(i % 3) + 1}`}><h4 className="font-bold text-primary">{t.name}</h4><p className="text-muted-foreground text-sm leading-relaxed mt-2">{t.desc}</p></div>
          ))}
        </div>
      </Section>

      {/* Roadmap */}
      <section id="roadmap" className="bg-primary py-24 lg:py-32 px-6 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 circuit-grid opacity-[0.04]" />
        <img src="/brand/ark-mark-web.png" alt="" aria-hidden className="absolute -left-16 -bottom-16 w-[360px] opacity-[0.07] pointer-events-none select-none" />
        <div className="relative max-w-7xl mx-auto">
          <SectionHead light center eyebrow="Growth roadmap" title="From regional foundation to national model." />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROADMAP.map((r, i) => (
              <div key={r.phase} className={`bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-glow/30 transition-colors reveal d${i + 1}`}>
                <div className="font-mono text-xs text-glow font-bold tracking-wider uppercase">{r.phase}</div>
                <h3 className="font-display text-2xl font-black text-white mt-1 mb-4">{r.title}</h3>
                <ul className="grid gap-2.5">{r.items.map((x) => <li key={x} className="flex gap-2.5 text-white/65 text-sm"><Check size={16} className="text-glow shrink-0 mt-0.5" />{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand title="Be part of the foundation." lead="We are in our launch year. Founding partners, donors, and volunteers shape what this organization becomes." primary={{ label: "Support our mission", to: "/donate" }} secondary={{ label: "Become a founding partner", to: "/get-involved#partners" }} />
    </>
  );
}
