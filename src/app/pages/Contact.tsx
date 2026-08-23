import { useState, type FormEvent } from "react";
import { Mail, Instagram, Linkedin, Send, Check } from "lucide-react";
import { ORG } from "../lib/content";
import { PageHero } from "../components/site/PageHero";
import { Section, Card, Eyebrow } from "../components/site/Primitives";

const Field = ({ label, name, type = "text", required = true, textarea = false }: { label: string; name: string; type?: string; required?: boolean; textarea?: boolean }) => (
  <label className="block">
    <span className="text-sm font-semibold text-primary">{label}{required && <span className="text-accent"> *</span>}</span>
    {textarea
      ? <textarea name={name} required={required} rows={5} className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent resize-y" />
      : <input name={name} type={type} required={required} className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />}
  </label>
);

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = encodeURIComponent(`Name: ${fd.get("first")} ${fd.get("last")}\nEmail: ${fd.get("email")}\nI am a: ${fd.get("role")}\n\n${fd.get("message")}`);
    window.location.href = `mailto:${ORG.email}?subject=${encodeURIComponent("Website inquiry")}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <PageHero crumb="Contact" eyebrow="Get in touch" title="Let's talk." lead="Questions about the curriculum, booking a workshop, partnering, or joining the team? Send us a note and we will get back to you." />

      <Section>
        <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-10 items-start">
          <Card hover={false} className="!p-10 reveal">
            {sent ? (
              <div className="text-center py-10"><div className="w-16 h-16 rounded-full bg-accent/10 text-accent grid place-items-center mx-auto mb-5"><Check size={30} /></div><h2 className="font-display text-3xl font-black text-primary">Thanks for reaching out.</h2><p className="text-muted-foreground mt-3">Your email client should have opened with your message. We will reply soon.</p></div>
            ) : (
              <form onSubmit={submit} className="grid gap-5">
                <div className="grid sm:grid-cols-2 gap-5"><Field label="First name" name="first" /><Field label="Last name" name="last" /></div>
                <Field label="Email" name="email" type="email" />
                <label className="block"><span className="text-sm font-semibold text-primary">I am a <span className="text-accent">*</span></span>
                  <select name="role" required className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
                    <option value="">Choose one</option><option>Teacher or school administrator</option><option>Parent</option><option>Student (grades 9-12)</option><option>Potential partner or sponsor</option><option>Volunteer</option><option>Other</option>
                  </select></label>
                <Field label="Message" name="message" textarea />
                <button type="submit" className="sheen inline-flex justify-center items-center gap-2 bg-accent text-white py-4 rounded-full font-bold hover:bg-accent/90 hover:scale-[1.02] transition-all shadow-lg shadow-accent/25">Send message <Send size={16} /></button>
              </form>
            )}
          </Card>

          <div className="grid gap-4">
            <Card className="reveal d1"><Eyebrow>Email</Eyebrow><a href={`mailto:${ORG.email}`} className="block font-display text-xl font-black text-primary mt-2 hover:text-accent transition-colors break-all">{ORG.email}</a></Card>
            <Card className="reveal d2"><Eyebrow>Follow along</Eyebrow>
              <div className="flex gap-3 mt-4">{[[Instagram, "Instagram", "#"], [Linkedin, "LinkedIn", "#"], [Mail, "Email", `mailto:${ORG.email}`]].map(([I, l, h]) => { const Icon = I as typeof Mail; return <a key={l as string} href={h as string} aria-label={l as string} className="w-11 h-11 rounded-xl bg-secondary border border-border grid place-items-center text-primary hover:bg-accent hover:text-white hover:border-accent transition-all"><Icon size={18} /></a>; })}</div></Card>
            <div id="newsletter" className="scroll-mt-28 rounded-2xl bg-primary text-white p-8 relative overflow-hidden reveal d3">
              <div className="absolute inset-0 circuit-grid opacity-[0.05]" />
              <div className="relative"><Eyebrow light>Mailing list</Eyebrow><h3 className="font-display text-2xl font-black mt-2">Join our community</h3><p className="text-white/65 text-sm mt-2">Updates, new resources, and upcoming workshops. A few emails a year, nothing more.</p>
                {subscribed ? <p className="mt-5 flex items-center gap-2 text-glow font-semibold"><Check size={18} /> You're on the list.</p> : (
                  <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} className="flex gap-2 mt-5"><input type="email" required placeholder="Your email" aria-label="Email" className="flex-1 min-w-0 px-4 py-3 rounded-full bg-white/8 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-glow" /><button className="bg-accent text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-accent/90">Join</button></form>)}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
