import { Target, Eye, Star, Users, Lightbulb, Check } from "lucide-react";
import { ReviewBadge, type Reviewer } from "../components/site/ReviewBadge";
import { ORG, VALUES, ROADMAP, LEADERSHIP, TEAMS } from "../lib/content";
import { PageHero } from "../components/site/PageHero";
import { Section, SectionHead, Card, CardTitle, IconBox, CTABand, Ticks } from "../components/site/Primitives";

const leadIcons = [Star, Users, Lightbulb];

const STATUSES = [
  { status: "draft", text: "Written by the ARK curriculum team. Ready to use, and it may still change after review." },
  { status: "in-review", text: "An outside expert is checking it for accuracy and for fit with the grade band." },
  { status: "reviewed", text: "The review is done. The reviewer's name appears on the module page and below." },
] as const;

type ReviewerEntry = Reviewer & { modules: { title: string; href: string }[] };

export default function About({ reviewers }: { reviewers: ReviewerEntry[] }) {
  return (
    <>
      <PageHero crumb="About" eyebrow="Who we are" title="A nonprofit built with parents, teachers, and students, not just for them."
        lead="ARK (AI Readiness for Kids) is a 501(c)(3) nonprofit. We believe every child deserves to understand the AI tools shaping their world, and the confidence to use them with intention and integrity." />

      <Section className="!pb-0" labelledBy="mission-h">
        <h2 id="mission-h" className="sr-only">Mission and vision</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card><IconBox><Target aria-hidden="true" /></IconBox><CardTitle className="!text-display-sm">Our mission</CardTitle><p className="mt-3 text-lesson text-ink-soft">{ORG.mission}</p></Card>
          <Card><IconBox><Eye aria-hidden="true" /></IconBox><CardTitle className="!text-display-sm">Our vision</CardTitle><p className="mt-3 text-lesson text-ink-soft">{ORG.vision}</p></Card>
        </div>
      </Section>

      {/* Values */}
      <Section labelledBy="values-h">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <SectionHead id="values-h" eyebrow="What we stand for" title="Five values that guide everything." lead="From the way we write curriculum to the partners we choose, every decision runs through these five commitments." />
          <ol className="divide-y divide-line border-y border-line">
            {VALUES.map((v, i) => (
              <li key={v.word} className="flex gap-5 py-6">
                <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft font-display font-semibold text-brand">{i + 1}</span>
                <div><CardTitle>{v.word}</CardTitle><p className="mt-1 text-ui text-ink-soft">{v.desc}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Review process (linked from every module's review badge) */}
      <Section id="reviewers" tint labelledBy="reviewers-h">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <SectionHead id="reviewers-h" eyebrow="Expert review" title="How modules are reviewed." lead="Every module shows where it stands, so teachers and families know exactly what they are looking at. We would rather say a lesson is a draft than overstate it." />
          <div>
            <ol className="grid gap-4">
              {STATUSES.map(({ status, text }) => (
                <li key={status} className="rounded-xl border border-line bg-surface p-5 shadow-1">
                  <ReviewBadge status={status} />
                  <p className="mt-3 text-ui text-ink-soft">{text}</p>
                </li>
              ))}
            </ol>
            <h3 className="mt-10 text-display-sm text-ink">Our reviewers</h3>
            {reviewers.length > 0 ? (
              <ul className="mt-4 grid gap-3">
                {reviewers.map((r) => (
                  <li key={r.name} className="rounded-xl border border-line bg-surface p-5 shadow-1">
                    <p className="font-bold text-ink">{r.name}{r.credentials && <span className="font-normal text-ink-soft">, {r.credentials}</span>}</p>
                    <p className="mt-1 text-small text-ink-soft">Reviewed: {r.modules.map((m, i) => <span key={m.href}>{i > 0 && ", "}<a href={m.href} className="rounded-sm text-brand underline underline-offset-4">{m.title}</a></span>)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-ui text-ink-soft">No module has finished expert review yet, so there are no names to show. Reviewers and their credentials will be listed here as each review is completed.</p>
            )}
            <p className="mt-6 text-ui text-ink-soft">Are you a teacher or subject expert? <a href="/get-involved#volunteer" className="rounded-sm font-bold text-brand underline underline-offset-4">Help review a module</a>.</p>
          </div>
        </div>
      </Section>

      {/* Team */}
      <Section id="team" labelledBy="team-h">
        <SectionHead id="team-h" eyebrow="Leadership and team" title="How ARK is organized." lead="A lean, accountable structure that pairs strategic direction with deep classroom expertise." />
        <ul className="grid gap-5 md:grid-cols-3">
          {LEADERSHIP.map((l, i) => { const Icon = leadIcons[i]; return (
            <li key={l.role}><Card className="h-full"><IconBox><Icon aria-hidden="true" /></IconBox><CardTitle>{l.role}</CardTitle><p className="mt-2 text-ui text-ink-soft">{l.desc}</p></Card></li>
          ); })}
        </ul>
        <h3 className="mt-14 text-display-sm text-ink">Core teams</h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAMS.map((t) => (
            <li key={t.name} className="rounded-xl bg-surface-2 p-6"><h4 className="font-sans text-ui font-bold text-ink">{t.name}</h4><p className="mt-2 text-small text-ink-soft">{t.desc}</p></li>
          ))}
        </ul>
      </Section>

      {/* Roadmap */}
      <Section id="roadmap" tint labelledBy="roadmap-h">
        <SectionHead id="roadmap-h" eyebrow="Growth roadmap" title="From regional foundation to national model." lead="These are goals, not results yet. We are in our launch year." />
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {ROADMAP.map((r) => (
            <li key={r.phase} className="rounded-xl border border-line bg-surface p-6 shadow-1">
              <p className="text-small font-bold uppercase tracking-[0.14em] text-brand">{r.phase}</p>
              <CardTitle className="mt-1">{r.title}</CardTitle>
              <Ticks className="mt-4 [&_li]:text-small" icon={<Check />} items={r.items} />
            </li>
          ))}
        </ol>
      </Section>

      <CTABand title="Be part of the foundation." lead="We are in our launch year. Founding partners, donors, and volunteers shape what this organization becomes." primary={{ label: "Support our mission", to: "/donate" }} secondary={{ label: "Become a founding partner", to: "/get-involved#partners" }} />
    </>
  );
}
