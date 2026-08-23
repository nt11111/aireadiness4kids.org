import { Star, HeartHandshake, Building2, Heart, GraduationCap, Users, Award, Check, School, Briefcase, Landmark, Library } from "lucide-react";
import { TIERS, FAQ } from "../lib/content";
import { PageHero } from "../components/site/PageHero";
import { Section, SectionHead, Btn, Card, IconBox, CTABand, Eyebrow, H2, Lead } from "../components/site/Primitives";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function GetInvolved() {
  const [faq, setFaq] = useState<number | null>(0);
  return (
    <>
      <PageHero crumb="Get Involved" eyebrow="Join us" title="There is a place for you in this work."
        lead="Student, educator, volunteer, company, or donor. Your time and support keep responsible AI literacy free for every child."
        actions={<><Btn to="#ambassadors" arrow>Become an ambassador</Btn><Btn to="/donate" variant="ghost">Donate</Btn></>} />

      {/* Quick paths */}
      <Section className="!py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[["#ambassadors", Star, "Students", "Lead at your school"], ["#volunteer", HeartHandshake, "Volunteers", "Give your time"], ["#partners", Building2, "Partners", "Schools and companies"], ["/donate", Heart, "Donors", "Fund free access"]].map(([to, Icon, t, d], i) => {
            const I = Icon as typeof Star;
            return (
              <a key={t as string} href={to as string} className={`bg-card border border-border rounded-2xl p-7 text-center hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(13,31,51,.12)] hover:border-accent/30 transition-all reveal d${i + 1}`}>
                <IconBox className="mx-auto"><I size={22} /></IconBox><h3 className="font-display text-xl font-black text-primary">{t as string}</h3><p className="text-muted-foreground text-sm mt-1">{d as string}</p>
              </a>
            );
          })}
        </div>
      </Section>

      {/* Ambassadors */}
      <Section id="ambassadors" className="bg-white border-y border-border">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="reveal">
            <Eyebrow>Student Ambassador Program</Eyebrow>
            <H2>High schoolers leading the way.</H2>
            <Lead>Students in grades 9 to 12 serve as peer advocates for responsible AI at their own schools. Peer-to-peer delivery is more credible for K-12 audiences, and one trained teen can reach hundreds of classmates.</Lead>
            <ul className="grid gap-5 mt-8">
              {[[GraduationCap, "One-day certification training", "Everything you need to facilitate confidently."], [Users, "One workshop per semester", "At your own school or in your community."], [Award, "Recognition and co-authorship", "A letter of recognition and credit on content you contribute."]].map(([I, t, d]) => {
                const Icon = I as typeof Users;
                return <li key={t as string} className="flex gap-4"><IconBox className="mb-0 shrink-0 w-11 h-11"><Icon size={20} /></IconBox><div><div className="font-bold text-primary">{t as string}</div><div className="text-muted-foreground text-sm mt-0.5">{d as string}</div></div></li>;
              })}
            </ul>
            <Btn to="/contact" className="mt-9" arrow>Apply now</Btn>
          </div>
          <div className="relative rounded-3xl bg-primary p-10 overflow-hidden reveal d2">
            <div className="absolute inset-0 circuit-grid opacity-[0.05]" />
            <img src="/brand/ark-mark-web.png" alt="" aria-hidden className="absolute -right-8 -bottom-8 w-56 opacity-[0.12] pointer-events-none" />
            <div className="relative">
              <h3 className="font-display text-2xl font-black text-white">Why student ambassadors?</h3>
              <p className="text-white/65 leading-relaxed mt-4">Ambassadors create an organic reach multiplier. One trained teen can run workshops for hundreds of classmates without a staff facilitator present. This mirrors the model used successfully by Cyber For Youth.</p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[["9-12", "Grades eligible"], ["1 day", "Certification training"]].map(([n, l]) => (
                  <div key={l} className="bg-white/8 border border-white/12 rounded-xl p-5"><div className="font-display text-3xl font-black text-glow">{n}</div><div className="text-white/60 text-xs font-mono uppercase tracking-wider mt-1">{l}</div></div>
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
          <Card className="reveal d1"><IconBox><Star size={22} /></IconBox><h3 className="font-display text-2xl font-black text-primary mb-2">National team</h3><p className="text-muted-foreground leading-relaxed">Core paid or stipended positions for college students and recent graduates, aligned with our five teams. A competitive, cohort-based application process, annual or semester.</p></Card>
          <Card className="reveal d2"><IconBox><HeartHandshake size={22} /></IconBox><h3 className="font-display text-2xl font-black text-primary mb-3">General volunteers</h3>
            <ul className="grid gap-2.5">{["Workshop volunteers support facilitators and manage materials", "Event volunteers help at conferences and community events", "Curriculum reviewers (parents and teachers) test draft modules"].map((x) => <li key={x} className="flex gap-2.5 text-foreground/75 text-[15px]"><Check size={17} className="text-accent shrink-0 mt-0.5" />{x}</li>)}</ul></Card>
        </div>
        <div className="text-center mt-10 reveal"><Btn to="/contact" arrow>Volunteer with us</Btn></div>
      </Section>

      {/* Partners */}
      <Section id="partners" className="bg-white border-y border-border">
        <SectionHead center eyebrow="Partnership strategy" title="Partner with us." lead="We build anchor relationships with schools, companies, universities, and community organizations to extend reach and deepen impact." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[[School, "Schools and Districts", "Priority scheduling, co-branding, teacher PD, and a voice in curriculum development."], [Briefcase, "Corporate", "Tech companies with CSR or responsible-AI programs. Logo placement, recognition, employee volunteering."], [Landmark, "Universities", "Intern and volunteer pipeline, co-developed research, and summit hosting."], [Library, "Community Orgs", "Libraries, YMCAs, Boys and Girls Clubs, and after-school programs."]].map(([I, t, d], i) => {
            const Icon = I as typeof School;
            return <Card key={t as string} className={`reveal d${i + 1}`}><IconBox><Icon size={22} /></IconBox><h3 className="font-display text-xl font-black text-primary mb-2">{t as string}</h3><p className="text-muted-foreground text-sm leading-relaxed">{d as string}</p></Card>;
          })}
        </div>
        <h3 className="font-display text-3xl font-black text-primary text-center mb-8 reveal">Corporate partnership tiers</h3>
        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((t, i) => (
            <div key={t.name} className={`relative bg-card rounded-2xl p-8 border transition-all hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(13,31,51,.12)] reveal d${i + 1} ${t.featured ? "border-accent shadow-[0_0_0_1px_#2F8FE6]" : "border-border"}`}>
              {t.featured && <span className="absolute -top-3 left-8 bg-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most popular</span>}
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent font-bold">Tier {3 - i}</div>
              <h4 className="font-display text-xl font-black text-primary mt-1">{t.name}</h4>
              <div className="font-display text-3xl font-black text-primary mt-2 mb-5">{t.amount}</div>
              <ul className="grid gap-2.5">{t.perks.map((p) => <li key={p} className="flex gap-2.5 text-foreground/75 text-[15px]"><Check size={17} className="text-accent shrink-0 mt-0.5" />{p}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-10 reveal"><Btn to="/contact" arrow>Start a partnership conversation</Btn></div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionHead center eyebrow="Questions" title="Frequently asked." />
        <div className="max-w-3xl mx-auto divide-y divide-border border-y border-border">
          {FAQ.map((f, i) => (
            <div key={f.q}>
              <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} className="w-full flex items-center justify-between gap-6 py-6 text-left">
                <span className="font-display text-lg font-bold text-primary">{f.q}</span>
                <Plus size={22} className={`text-accent shrink-0 transition-transform ${faq === i ? "rotate-45" : ""}`} />
              </button>
              <div className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: faq === i ? "1fr" : "0fr" }}><div className="overflow-hidden"><p className="text-muted-foreground leading-relaxed pb-6">{f.a}</p></div></div>
            </div>
          ))}
        </div>
      </Section>

      <CTABand title="Keep responsible AI literacy free." lead="All curriculum and core programs are free to students and schools, and they always will be. Your gift keeps it that way." primary={{ label: "Donate", to: "/donate" }} />
    </>
  );
}
