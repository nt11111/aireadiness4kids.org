import { useState, type FormEvent } from "react";
import { Send, Check } from "lucide-react";
import { ORG } from "../lib/content";
import { Card, Eyebrow } from "../components/site/Primitives";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../components/ui/utils";

const control = "mt-2 w-full px-4 py-3 rounded-xl border-[1.5px] border-input bg-input-background text-ink";

const Field = ({ label, name, type = "text", autoComplete, textarea = false }: { label: string; name: string; type?: string; autoComplete?: string; textarea?: boolean }) => (
  <label className="block">
    <span className="text-sm font-semibold text-ink">{label}<span className="text-danger" aria-hidden="true"> *</span></span>
    {textarea
      ? <textarea name={name} required rows={5} className={cn(control, "resize-y")} />
      : <input name={name} type={type} required autoComplete={autoComplete} className={control} />}
  </label>
);

/** Island: contact form + mailing list. Both use email until a form backend exists. */
export function ContactPanel() {
  const [sent, setSent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = encodeURIComponent(`Name: ${fd.get("first")} ${fd.get("last")}\nEmail: ${fd.get("email")}\nI am a: ${fd.get("role")}\n\n${fd.get("message")}`);
    window.location.href = `mailto:${ORG.email}?subject=${encodeURIComponent("Website inquiry")}&body=${body}`;
    setSent(true);
  };

  // No mailing-list service yet: open a pre-filled email rather than pretend to subscribe.
  const subscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    window.location.href = `mailto:${ORG.email}?subject=${encodeURIComponent("Add me to the ARK mailing list")}&body=${encodeURIComponent(`Please add ${email} to the ARK mailing list.`)}`;
    setSubscribed(true);
  };

  return (
    <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-10 items-start">
      <Card hover={false} className="!p-10 reveal">
        {sent ? (
          <div className="text-center py-10" role="status">
            <div className="w-16 h-16 rounded-full bg-brand-soft text-brand grid place-items-center mx-auto mb-5"><Check size={30} aria-hidden="true" /></div>
            <h2 className="font-display text-3xl font-black text-ink">Thanks for reaching out.</h2>
            <p className="text-muted-foreground mt-3">Your email client should have opened with your message. We will reply soon.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-5">
            <p className="text-sm text-muted-foreground">Fields marked <span className="text-danger" aria-hidden="true">*</span><span className="sr-only">with an asterisk</span> are required.</p>
            <div className="grid sm:grid-cols-2 gap-5"><Field label="First name" name="first" autoComplete="given-name" /><Field label="Last name" name="last" autoComplete="family-name" /></div>
            <Field label="Email" name="email" type="email" autoComplete="email" />
            <label className="block"><span className="text-sm font-semibold text-ink">I am a<span className="text-danger" aria-hidden="true"> *</span></span>
              <select name="role" required className={control}>
                <option value="">Choose one</option><option>Teacher or school administrator</option><option>Parent</option><option>Student (grades 9-12)</option><option>Potential partner or sponsor</option><option>Volunteer</option><option>Other</option>
              </select>
            </label>
            <Field label="Message" name="message" textarea />
            <button type="submit" className={buttonVariants({ size: "lg" })}>Send message <Send aria-hidden="true" /></button>
          </form>
        )}
      </Card>

      <div className="grid gap-4">
        <Card className="reveal d1"><Eyebrow>Email</Eyebrow><a href={`mailto:${ORG.email}`} className="block font-display text-xl font-black text-ink mt-2 underline decoration-2 decoration-brand/40 underline-offset-4 hover:text-brand hover:decoration-brand break-all">{ORG.email}</a></Card>
        <div id="newsletter" className="on-dark rounded-2xl bg-ink text-white p-8 relative overflow-hidden reveal d2">
          <div className="absolute inset-0 circuit-grid opacity-[0.05]" />
          <div className="relative">
            <Eyebrow light>Mailing list</Eyebrow>
            <h2 className="font-display text-2xl font-black mt-2">Join our community</h2>
            <p className="text-white/75 text-sm mt-2">Updates, new resources, and upcoming workshops. A few emails a year, nothing more.</p>
            {subscribed ? (
              <p role="status" className="mt-5 flex items-center gap-2 text-glow font-semibold"><Check size={18} aria-hidden="true" /> Your email app should open. Send the message to join.</p>
            ) : (
              <form onSubmit={subscribe} className="mt-5">
                <label htmlFor="newsletter-email" className="text-sm font-semibold text-white">Email address</label>
                <div className="flex gap-2 mt-2">
                  <input id="newsletter-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="flex-1 min-w-0 px-4 py-3 rounded-full bg-white/[0.08] border-[1.5px] border-white/40 text-white placeholder:text-white/60" />
                  <button type="submit" className={buttonVariants({ variant: "accent" })}>Join</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
