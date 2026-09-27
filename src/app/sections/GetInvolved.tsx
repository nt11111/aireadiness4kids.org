import { useState, type HTMLAttributes } from "react";
import { Star, HeartHandshake, Building2, Heart, GraduationCap, Users, Award, Check, School, Briefcase, Landmark, Library, Plus, ArrowRight, type LucideIcon } from "lucide-react";
import { TIERS, FAQ } from "../lib/content";
import { PageHero } from "../components/site/PageHero";
import { Section, SectionHead, Btn, Card, CardTitle, IconBox, CTABand, Eyebrow, H2, Lead, Ticks } from "../components/site/Primitives";
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
        actions={<><Btn to="#ambassadors" size="lg" arrow>Become an ambassador</Btn><Btn to="/donate" size="lg" variant="outline">Donate</Btn></>} />

      {/* Quick paths */}
      <Section className="!pb-0" labelledBy="paths-h">
        <h2 id="paths-h" className="sr-only">Ways to help</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {paths.map(([to, Icon, t, d]) => (
            <li key={t}>
              <a href={to} className="group flex h-full items-center gap-4 rounded-xl border border-line bg-surface p-5 shadow-1 transition-[border-color,box-shadow] duration-[var(--dur)] hover:border-brand hover:shadow-2">
                <IconBox className="mb-0 shrink-0"><Icon aria-hidden="true" /></IconBox>
                <span className="min-w-0 flex-1"><span className="block font-display text-title font-semibold text-ink group-hover:text-brand">{t}</span><span className="block text-small text-ink-soft">{d}</span></span>
                <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-brand transition-transform duration-[var(--dur)] group-hover:translate-x-0.5" />
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* Ambassadors */}
      <Section id="ambassadors" labelledBy="ambassadors-h">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <Eyebrow>Student Ambassador Program</Eyebrow>
            <H2 id="ambassadors-h">High schoolers leading the way.</H2>
            <Lead>Students in grades 9 to 12 serve as peer advocates for responsible AI at their own schools. Peer-to-peer delivery is more credible for K-12 audiences, and one trained teen can reach hundreds of classmates.</Lead>
            <ul className="mt-8 grid gap-5">
              {perks.map(([Icon, t, d]) => (
                <li key={t} className="flex gap-4"><IconBox className="mb-0 shrink-0"><Icon aria-hidden="true" /></IconBox><div><p className="font-bold text-ink">{t}</p><p className="mt-0.5 text-small text-ink-soft">{d}</p></div></li>
              ))}
            </ul>
            <Btn to="/contact" className="mt-9" arrow>Apply now</Btn>
          </div>
          <Card className="bg-surface-2 shadow-none">
            <CardTitle>Why student ambassadors?</CardTitle>
            <p className="mt-3 text-ui text-ink-soft">Ambassadors create an organic reach multiplier. One trained teen can run workshops for hundreds of classmates without a staff facilitator present. This mirrors the model used successfully by Cyber For Youth.</p>
            <dl className="mt-6 grid grid-cols-2 gap-4">
              {[["9-12", "Grades eligible"], ["1 day", "Certification training"]].map(([n, l]) => (
                <div key={l} className="rounded-lg bg-surface p-5"><dt className="text-small text-ink-soft">{l}</dt><dd className="mt-1 font-display text-display-sm font-semibold text-ink">{n}</dd></div>
              ))}
            </dl>
          </Card>
        </div>
      </Section>

      {/* Volunteer */}
      <Section id="volunteer" tint labelledBy="volunteer-h">
        <SectionHead id="volunteer-h" eyebrow="Volunteers and national team" title="Many ways to give your time." />
        <div className="grid gap-5 md:grid-cols-2">
          <Card><IconBox><Star aria-hidden="true" /></IconBox><CardTitle>National team</CardTitle><p className="mt-2 text-ui text-ink-soft">Core paid or stipended positions for college students and recent graduates, aligned with our five teams. A competitive, cohort-based application process, annual or semester.</p></Card>
          <Card><IconBox><HeartHandshake aria-hidden="true" /></IconBox><CardTitle>General volunteers</CardTitle>
            <Ticks className="mt-3" icon={<Check />} items={["Workshop volunteers support facilitators and manage materials", "Event volunteers help at conferences and community events", "Curriculum reviewers (parents and teachers) test draft modules"]} /></Card>
        </div>
        <Btn to="/contact" className="mt-10" arrow>Volunteer with us</Btn>
      </Section>

      {/* Partners */}
      <Section id="partners" labelledBy="partners-h">
        <SectionHead id="partners-h" eyebrow="Partnership strategy" title="Partner with us." lead="We build anchor relationships with schools, companies, universities, and community organizations to extend reach and deepen impact." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partnerTypes.map(([Icon, t, d]) => (
            <li key={t}><Card className="h-full !p-6"><IconBox><Icon aria-hidden="true" /></IconBox><CardTitle>{t}</CardTitle><p className="mt-2 text-small text-ink-soft">{d}</p></Card></li>
          ))}
        </ul>
        <h3 className="mt-16 text-display-sm text-ink">Corporate partnership tiers</h3>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <li key={t.name} className={cn("rounded-xl border bg-surface p-6 shadow-1 sm:p-8", t.featured ? "border-brand border-2" : "border-line")}>
              <p className="text-small font-bold uppercase tracking-[0.14em] text-brand">Tier {3 - i}</p>
              <h4 className="mt-1 font-display text-title font-semibold text-ink">{t.name}</h4>
              <p className="mt-2 mb-5 font-display text-display-sm font-semibold text-ink">{t.amount}</p>
              <Ticks icon={<Check />} items={t.perks} />
            </li>
          ))}
        </ul>
        <Btn to="/contact" className="mt-10" arrow>Start a partnership conversation</Btn>
      </Section>
    </>
  );
}

/** Island: FAQ accordion. Closed answers are inert so they can't take focus. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section tint labelledBy="faq-h">
      <SectionHead id="faq-h" eyebrow="Questions" title="Frequently asked." />
      <div className="max-w-3xl divide-y divide-line border-y border-line">
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <h3>
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`} className="flex w-full items-center justify-between gap-6 rounded-md py-5 text-left">
                  <span className="font-display text-title font-semibold text-ink">{f.q}</span>
                  <Plus aria-hidden="true" className={cn("size-5 shrink-0 text-brand transition-transform duration-[var(--dur)]", isOpen && "rotate-45")} />
                </button>
              </h3>
              <div id={`faq-${i}`} className="grid transition-[grid-template-rows] duration-[var(--dur-slow)]" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }} {...inertWhen(!isOpen)}>
                <div className="overflow-hidden"><p className="max-w-reading pb-6 text-ui text-ink-soft">{f.a}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function GetInvolvedCta() {
  return <CTABand title="Keep responsible AI literacy free." lead="All curriculum and core programs are free to students and schools, and they always will be. Your gift keeps it that way." primary={{ label: "Donate", to: "/donate" }} secondary={{ label: "Contact us", to: "/contact" }} />;
}
