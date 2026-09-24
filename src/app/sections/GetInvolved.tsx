import { useState, type HTMLAttributes } from "react";
import { Star, HeartHandshake, Building2, Heart, GraduationCap, Users, Award, Check, School, Briefcase, Landmark, Library, Plus, type LucideIcon } from "lucide-react";
import { TIERS, FAQ } from "../lib/content";
import { PageHero } from "../components/site/PageHero";
import { Section, SectionHead, Btn, Card, IconBox, CTABand, Eyebrow, H2, Lead } from "../components/site/Primitives";
import { cn } from "../components/ui/utils";

const inertWhen = (on: boolean) => (on ? { inert: "" } : {}) as HTMLAttributes<HTMLDivElement>;

const paths: [string, LucideIcon, string, string][] = [
  ["#ambassadors", Star, "Students", "Lead at your school"],
  ["#volunteer", HeartHandshake, "Volunteers", "Give your time"],
  ["#partners", Building2, "Partners", "Schools and companies"],
  ["/donate", Heart, "Donors", "Fund free access"],
];
const perks: [LucideIcon, string, string][] = [
  [GraduationCap, "One-day certification training", "Everything you need to facilitate confidently."],
  [Users, "One workshop per semester", "At your own school or in your community."],
  [Award, "Recognition and co-authorship", "A letter of recognition and credit on content you contribute."],
];
const partnerTypes: [LucideIcon, string, string][] = [
  [School, "Schools and Districts", "Priority scheduling, co-branding, teacher PD, and a voice in curriculum development."],
  [Briefcase, "Corporate", "Tech companies with CSR or responsible-AI programs. Logo placement, recognition, employee volunteering."],
  [Landmark, "Universities", "Intern and volunteer pipeline, co-developed research, and summit hosting."],
  [Library, "Community Orgs", "Libraries, YMCAs, Boys and Girls Clubs, and after-school programs."],
];

export function GetInvolvedTop() {
  return (
    <>
      <PageHero crumb="Get Involved" eyebrow="Join us" title="There is a place for you in this work."
        lead="Student, educator, volunteer, company, or donor. Your time and support keep responsible AI literacy free for every child."
        actions={<><Btn to="#ambassadors" arrow>Become an ambassador</Btn><Btn to="/donate" variant="ghost">Donate</Btn></>} />

      {/* Quick paths */}
      <Section className="!py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paths.map(([to, Icon, t, d], i) => (
            <a key={t} href={to} className={`bg-card border border-border rounded-2xl p-7 text-center shadow-1 hover:-translate-y-1 hover:shadow-2 hover:border-brand/30 transition-[transform,box-shadow,border-color] duration-[var(--dur-slow)] reveal d${i + 1}`}>
              <IconBox className="mx-auto"><Icon size={22} aria-hidden="true" /></IconBox><h2 className="font-display text-xl font-black text-ink">{t}</h2><p className="text-muted-foreground text-sm mt-1">{d}</p>
            </a>
          ))}
        </div>
      </Section>

      {/* Ambassadors */}
      <Section id="ambassadors" className="bg-surface border-y border-border">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="reveal">
            <Eyebrow>Student Ambassador Program</Eyebrow>
            <H2>High schoolers leading the way.</H2>
            <Lead>Students in grades 9 to 12 serve as peer advocates for responsible AI at their own schools. Peer-to-peer delivery is more credible for K-12 audiences, and one trained teen can reach hundreds of classmates.</Lead>
            <ul className="grid gap-5 mt-8">
              {perks.map(([Icon, t, d]) => (
                <li key={t} className="flex gap-4"><IconBox className="mb-0 shrink-0 w-11 h-11"><Icon size={20} aria-hidden="true" /></IconBox><div><div className="font-bold text-ink">{t}</div><div className="text-muted-foreground text-sm mt-0.5">{d}</div></div></li>
              ))}
            </ul>
            <Btn to="/contact" className="mt-9" arrow>Apply now</Btn>
          </div>
          <div className="on-dark relative rounded-3xl bg-ink p-10 overflow-hidden reveal d2">
            <div className="absolute inset-0 circuit-grid opacity-[0.05]" />
            <img src="/brand/ark-mark-web.png" alt="" aria-hidden="true" className="absolute -right-8 -bottom-8 w-56 opacity-[0.12] pointer-events-none" />
            <div className="relative">
              <h3 className="font-display text-2xl font-black text-white">Why student ambassadors?</h3>
              <p className="text-white/75 leading-relaxed mt-4">Ambassadors create an organic reach multiplier. One trained teen can run workshops for hundreds of classmates without a staff facilitator present. This mirrors the model used successfully by Cyber For Youth.</p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[["9-12", "Grades eligible"], ["1 day", "Certification training"]].map(([n, l]) => (
                  <div key={l} className="bg-white/[0.08] border border-white/15 rounded-xl p-5"><div className="font-display text-3xl font-black text-glow">{n}</div><div className="text-white/75 text-xs font-mono uppercase tracking-wider mt-1">{l}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Volunteer */}
      <Section id="volunteer">
        <SectionHead center eyebrow="Volunteers and national team" title="Many ways to give your time." />
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="reveal d1"><IconBox><Star size={22} aria-hidden="true" /></IconBox><h3 className="font-display text-2xl font-black text-ink mb-2">National team</h3><p className="text-muted-foreground leading-relaxed">Core paid or stipended positions for college students and recent graduates, aligned with our five teams. A competitive, cohort-based application process, annual or semester.</p></Card>
          <Card className="reveal d2"><IconBox><HeartHandshake size={22} aria-hidden="true" /></IconBox><h3 className="font-display text-2xl font-black text-ink mb-3">General volunteers</h3>
            <ul className="grid gap-2.5">{["Workshop volunteers support facilitators and manage materials", "Event volunteers help at conferences and community events", "Curriculum reviewers (parents and teachers) test draft modules"].map((x) => <li key={x} className="flex gap-2.5 text-foreground/80 text-[15px]"><Check size={17} aria-hidden="true" className="text-brand shrink-0 mt-0.5" />{x}</li>)}</ul></Card>
        </div>
        <div className="text-center mt-10 reveal"><Btn to="/contact" arrow>Volunteer with us</Btn></div>
      </Section>

      {/* Partners */}
      <Section id="partners" className="bg-surface border-y border-border">
        <SectionHead center eyebrow="Partnership strategy" title="Partner with us." lead="We build anchor relationships with schools, companies, universities, and community organizations to extend reach and deepen impact." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {partnerTypes.map(([Icon, t, d], i) => (
            <Card key={t} className={`reveal d${i + 1}`}><IconBox><Icon size={22} aria-hidden="true" /></IconBox><h3 className="font-display text-xl font-black text-ink mb-2">{t}</h3><p className="text-muted-foreground text-sm leading-relaxed">{d}</p></Card>
          ))}
        </div>
        <h3 className="font-display text-3xl font-black text-ink text-center mb-8 reveal">Corporate partnership tiers</h3>
        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((t, i) => (
            <div key={t.name} className={cn("relative bg-card rounded-2xl p-8 border shadow-1 transition-[transform,box-shadow] duration-[var(--dur-slow)] hover:-translate-y-1 hover:shadow-2", `reveal d${i + 1}`, t.featured ? "border-brand shadow-[0_0_0_1px_var(--brand)]" : "border-border")}>
              {t.featured && <span className="absolute -top-3 left-8 bg-brand text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most popular</span>}
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand font-bold">Tier {3 - i}</div>
              <h4 className="font-display text-xl font-black text-ink mt-1">{t.name}</h4>
              <div className="font-display text-3xl font-black text-ink mt-2 mb-5">{t.amount}</div>
              <ul className="grid gap-2.5">{t.perks.map((p) => <li key={p} className="flex gap-2.5 text-foreground/80 text-[15px]"><Check size={17} aria-hidden="true" className="text-brand shrink-0 mt-0.5" />{p}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-10 reveal"><Btn to="/contact" arrow>Start a partnership conversation</Btn></div>
      </Section>
    </>
  );
}

/** Island: FAQ accordion. Closed answers are inert so they can't take focus. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section>
      <SectionHead center eyebrow="Questions" title="Frequently asked." />
      <div className="max-w-3xl mx-auto divide-y divide-border border-y border-border">
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <h3>
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`} className="w-full flex items-center justify-between gap-6 py-6 text-left rounded-md">
                  <span className="font-display text-lg font-bold text-ink">{f.q}</span>
                  <Plus size={22} aria-hidden="true" className={cn("text-brand shrink-0 transition-transform duration-[var(--dur)]", isOpen && "rotate-45")} />
                </button>
              </h3>
              <div id={`faq-${i}`} className="grid transition-[grid-template-rows] duration-[var(--dur-slow)]" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }} {...inertWhen(!isOpen)}>
                <div className="overflow-hidden"><p className="text-muted-foreground leading-relaxed pb-6">{f.a}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function GetInvolvedCta() {
  return <CTABand title="Keep responsible AI literacy free." lead="All curriculum and core programs are free to students and schools, and they always will be. Your gift keeps it that way." primary={{ label: "Donate", to: "/donate" }} />;
}
