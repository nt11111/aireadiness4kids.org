import { ArrowRight, Clock, Home, GraduationCap, Trophy, BarChart3, Mic, Mail, Share2, BookOpen, Library, Check } from "lucide-react";
import { TRACKS } from "../lib/content";
import { trackStyle } from "../lib/tracks";
import { PageHero } from "../components/site/PageHero";
import { Section, SectionHead, Btn, Card, IconBox, CTABand, Eyebrow, H2, Lead } from "../components/site/Primitives";
import { cn } from "../components/ui/utils";

const formats = [
  { t: "Express Workshop", time: "60 minutes", d: "A single-session introduction. Best for one classroom or a small group." },
  { t: "Half-Day Program", time: "3 hours", d: "A deep dive with activities and group discussions. Best for an entire grade." },
  { t: "Full-Day Immersive", time: "6 hours", d: "Multiple modules, activities, and a capstone project. Best for school-wide or district events." },
];

const more = [
  { id: "parents", Icon: Home, tag: "Program 03", t: "Parent Information Nights", d: "90-minute evening events at schools or community centers. Parents learn what AI is, how their kids use it, the risks, and how to have productive conversations at home. Available in English and Spanish." },
  { id: "pd", Icon: GraduationCap, tag: "Program 04", t: "Teacher Professional Development", d: "Half-day or full-day sessions that certify teachers to deliver ARK curriculum independently. Educators receive a credential, a facilitator kit, and ongoing access to updated materials." },
  { id: "summit", Icon: Trophy, tag: "Program 05", t: "Annual Student Summit", d: "A yearly virtual or hybrid event bringing together students, teachers, parents, and AI professionals. Keynotes, student-led panels, workshops, and a student project showcase." },
  { id: "research", Icon: BarChart3, tag: "Program 06", t: "Research and Impact Reports", d: "An annual publication documenting curriculum downloads, workshop reach, survey data, and trends in how K-12 students encounter AI." },
];

const channels = [
  { Icon: BookOpen, t: "Blog and articles", d: "Monthly posts on AI literacy topics by team members, teachers, and student contributors." },
  { Icon: Mail, t: "Newsletter", d: "A bi-monthly email to parents, teachers, and donors with updates, new resources, and upcoming workshops." },
  { Icon: Share2, t: "Social media", d: "TikTok and Instagram for student-facing content. LinkedIn for professionals and donors." },
  { Icon: Mic, t: "Podcast (Year 2+)", d: "Short 15 to 20 minute conversations with educators, AI professionals, and students." },
  { Icon: Library, t: "Resource library", d: "A curated, searchable database of third-party articles, videos, and tools." },
];

export default function Programs() {
  return (
    <>
      <PageHero crumb="Programs" eyebrow="Our programs" title="Six ways we bring responsible AI to kids, families, and educators."
        lead="All curriculum and core programs stay free to students and schools. We meet learners in classrooms, families at evening events, and teachers through professional development." />

      {/* Program 1 */}
      <Section className="bg-surface border-b border-border">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="reveal">
            <Eyebrow>Program 01 · The centerpiece</Eyebrow>
            <H2>Free Curriculum Library</H2>
            <Lead>A downloadable K-12 curriculum in three grade-banded tracks. Lesson plans, slide decks, facilitator guides, worksheets, and discussion banks. Refreshed every year.</Lead>
            <ul className="grid gap-3 mt-7">
              {["No login required, no paywall", "Reviewed by classroom teachers before release", "Standalone modules, teach in any order", "Updated annually to reflect AI developments"].map((x) => (
                <li key={x} className="flex gap-3 text-foreground/80"><Check size={18} aria-hidden="true" className="text-brand shrink-0 mt-1" />{x}</li>
              ))}
            </ul>
            <Btn to="/curriculum" className="mt-9" arrow>Browse all 17 modules</Btn>
          </div>
          <div className="grid gap-3 reveal d2">
            {TRACKS.map((t) => {
              const s = trackStyle(t.id);
              return (
                <a key={t.id} href={`/curriculum#${t.id}`} className={cn("group flex items-center justify-between rounded-2xl p-6 relative overflow-hidden shadow-1 hover:-translate-y-1 hover:shadow-2 transition-[transform,box-shadow] duration-[var(--dur-slow)]", s.fill)}>
                  <div><div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">{t.grades} · {t.modules} modules</div><div className="font-display text-2xl font-black mt-1">{t.label}</div></div>
                  <ArrowRight aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
                </a>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Workshops */}
      <Section id="workshops">
        <SectionHead center eyebrow="Program 02" title="In-School Workshops" lead="Facilitated sessions delivered by trained staff or certified volunteers, available in three formats to fit any schedule." />
        <div className="grid md:grid-cols-3 gap-5">
          {formats.map((f, i) => (
            <Card key={f.t} className={`reveal d${i + 1}`}>
              <IconBox><Clock size={22} aria-hidden="true" /></IconBox>
              <div className="font-mono text-xs text-brand font-bold tracking-wider uppercase">{f.time}</div>
              <h3 className="font-display text-2xl font-black text-ink mt-1 mb-3">{f.t}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed">{f.d}</p>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10 reveal"><Btn to="/contact" arrow>Book a workshop for your school</Btn></div>
      </Section>

      {/* 3-6 */}
      <Section className="bg-surface border-y border-border">
        <SectionHead eyebrow="More programs" title="Reaching families, teachers, and the wider community." />
        <div className="grid md:grid-cols-2 gap-5">
          {more.map(({ id, Icon, tag, t, d }, i) => (
            <Card key={id} className={`reveal d${(i % 2) + 1}`}>
              <div id={id}  />
              <IconBox><Icon size={22} aria-hidden="true" /></IconBox>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand font-bold">{tag}</div>
              <h3 className="font-display text-2xl font-black text-ink mt-1 mb-3">{t}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed">{d}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Channels */}
      <Section>
        <SectionHead center eyebrow="Content and media" title="Staying connected between events." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {channels.map(({ Icon, t, d }, i) => (
            <Card key={t} className={`reveal d${(i % 5) + 1}`}><IconBox className="w-10 h-10"><Icon size={18} aria-hidden="true" /></IconBox><h3 className="font-display text-lg font-bold text-ink mb-1.5">{t}</h3><p className="text-muted-foreground text-sm leading-relaxed">{d}</p></Card>
          ))}
        </div>
      </Section>

      <CTABand title="Bring a program to your community." lead="Schools, districts, libraries, and after-school programs, let us find the right format for your learners." primary={{ label: "Partner with us", to: "/get-involved#partners" }} secondary={{ label: "Explore the curriculum", to: "/curriculum" }} />
    </>
  );
}
