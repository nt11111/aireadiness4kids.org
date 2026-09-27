import { ArrowRight, Clock, Home, GraduationCap, Trophy, BarChart3, Mic, Mail, Share2, BookOpen, Library, Check } from "lucide-react";
import { trackStyle } from "../lib/tracks";
import { PageHero } from "../components/site/PageHero";
import { Section, SectionHead, Btn, Card, CardTitle, IconBox, CTABand, Eyebrow, H2, Lead, Ticks } from "../components/site/Primitives";
import { cn } from "../components/ui/utils";

const formats = [
  { t: "Express Workshop", time: "60 minutes", d: "A single-session introduction. Best for one classroom or a small group." },
  { t: "Half-Day Program", time: "3 hours", d: "A deep dive with activities and group discussions. Best for an entire grade." },
  { t: "Full-Day Immersive", time: "6 hours", d: "Multiple modules, activities, and a capstone project. Best for school-wide or district events." },
];

const more = [
  { id: "parents", Icon: Home, tag: "For families", t: "Parent Information Nights", d: "90-minute evening events at schools or community centers. Parents learn what AI is, how their kids use it, the risks, and how to have productive conversations at home. Available in English and Spanish." },
  { id: "pd", Icon: GraduationCap, tag: "For teachers", t: "Teacher Professional Development", d: "Half-day or full-day sessions that certify teachers to deliver ARK curriculum independently. Educators receive a credential, a facilitator kit, and ongoing access to updated materials." },
  { id: "summit", Icon: Trophy, tag: "For students", t: "Annual Student Summit", d: "A yearly virtual or hybrid event bringing together students, teachers, parents, and AI professionals. Keynotes, student-led panels, workshops, and a student project showcase." },
  { id: "research", Icon: BarChart3, tag: "What we learn", t: "Research and Impact Reports", d: "An annual publication documenting curriculum downloads, workshop reach, survey data, and trends in how K-12 students encounter AI." },
];

const channels = [
  { Icon: BookOpen, t: "Blog and articles", d: "Monthly posts on AI literacy topics by team members, teachers, and student contributors." },
  { Icon: Mail, t: "Newsletter", d: "A bi-monthly email to parents, teachers, and donors with updates, new resources, and upcoming workshops." },
  { Icon: Share2, t: "Social media", d: "TikTok and Instagram for student-facing content. LinkedIn for professionals and donors." },
  { Icon: Mic, t: "Podcast (Year 2+)", d: "Short 15 to 20 minute conversations with educators, AI professionals, and students." },
  { Icon: Library, t: "Resource library", d: "A curated, searchable database of third-party articles, videos, and tools." },
];

type TrackSummary = { id: string; title: string; grades: string; modules: number };

/** /workshops (was /programs): how ARK brings workshops and programs to schools and communities. */
export default function Workshops({ tracks }: { tracks: TrackSummary[] }) {
  return (
    <>
      <PageHero crumb="Workshops and programs" eyebrow="Bring ARK to your school" title="Six ways we bring responsible AI to kids, families, and educators."
        lead="All curriculum and core programs stay free to students and schools. We meet learners in classrooms, families at evening events, and teachers through professional development."
        actions={<><Btn to="/contact" size="lg" arrow>Request a workshop</Btn><Btn to="#workshops" size="lg" variant="outline">See workshop formats</Btn></>} />

      {/* Workshops: what most visitors here came for, so it comes first. */}
      <Section id="workshops" labelledBy="workshops-h">
        <SectionHead id="workshops-h" eyebrow="For schools and groups" title="In-School Workshops" lead="Facilitated sessions delivered by trained staff or certified volunteers, available in three formats to fit any schedule." />
        <ul className="grid gap-5 md:grid-cols-3">
          {formats.map((f) => (
            <li key={f.t}>
              <Card className="h-full">
                <p className="flex items-center gap-2 text-small font-bold uppercase tracking-[0.14em] text-brand"><Clock aria-hidden="true" className="size-4" />{f.time}</p>
                <CardTitle className="mt-2 !text-display-sm">{f.t}</CardTitle>
                <p className="mt-3 text-ui text-ink-soft">{f.d}</p>
              </Card>
            </li>
          ))}
        </ul>
        <Btn to="/contact" className="mt-10" arrow>Book a workshop for your school</Btn>
      </Section>

      {/* Program 1: the free courses */}
      <Section tint labelledBy="courses-h">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <Eyebrow>The centerpiece</Eyebrow>
            <H2 id="courses-h">Free Online Courses</H2>
            <Lead>Three free online courses, one for each grade band, with a slide deck for every module so teachers and workshop leaders can teach it live.</Lead>
            <Ticks className="mt-7" icon={<Check />} items={["Free forever, with no paywall", "Browse every course without an account", "Standalone modules, teach in any order", "Every module shows its expert-review status"]} />
            <Btn to="/courses" className="mt-9" arrow>Browse all {tracks.reduce((n, t) => n + t.modules, 0)} modules</Btn>
          </div>
          <ul className="grid gap-3">
            {tracks.map((t) => {
              const s = trackStyle(t.id);
              return (
                <li key={t.id}>
                  <a href={`/courses/${t.id}`} className="group flex items-center gap-4 overflow-hidden rounded-xl border border-line bg-surface shadow-1 transition-[border-color,box-shadow] duration-[var(--dur)] hover:border-ink-soft hover:shadow-2">
                    <span aria-hidden="true" className={cn("w-2 self-stretch", s.bar)} />
                    <span className="min-w-0 flex-1 py-5">
                      <span className={cn("block text-small font-bold", s.ink)}>Grades {t.grades} · {t.modules} modules</span>
                      <span className="mt-0.5 block font-display text-display-sm font-semibold text-ink">{t.title}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="mr-5 size-5 shrink-0 text-ink-soft transition-transform duration-[var(--dur)] group-hover:translate-x-0.5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* Programs 3-6 */}
      <Section labelledBy="more-h">
        <SectionHead id="more-h" eyebrow="More programs" title="Reaching families, teachers, and the wider community." />
        <ul className="grid gap-5 md:grid-cols-2">
          {more.map(({ id, Icon, tag, t, d }) => (
            <li key={id} id={id}>
              <Card className="h-full">
                <IconBox><Icon aria-hidden="true" /></IconBox>
                <p className="text-small font-bold uppercase tracking-[0.14em] text-brand">{tag}</p>
                <CardTitle className="mt-1 !text-display-sm">{t}</CardTitle>
                <p className="mt-3 text-ui text-ink-soft">{d}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* Channels */}
      <Section tint labelledBy="channels-h">
        <SectionHead id="channels-h" eyebrow="Content and media" title="Staying connected between events." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {channels.map(({ Icon, t, d }) => (
            <li key={t} className="rounded-xl bg-surface p-6 shadow-1"><IconBox><Icon aria-hidden="true" /></IconBox><CardTitle className="!text-ui font-sans font-bold">{t}</CardTitle><p className="mt-1.5 text-small text-ink-soft">{d}</p></li>
          ))}
        </ul>
      </Section>

      <CTABand title="Bring a program to your community." lead="Schools, districts, libraries, and after-school programs, let us find the right format for your learners." primary={{ label: "Request a workshop", to: "/contact" }} secondary={{ label: "Partner with us", to: "/get-involved#partners" }} />
    </>
  );
}
