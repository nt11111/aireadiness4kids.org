import { useState, type FormEvent } from "react";
import { Send, Check, Mail } from "lucide-react";
import { ORG } from "../lib/content";
import { Card, CardTitle, Eyebrow } from "../components/site/Primitives";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../components/ui/utils";

const control = "mt-2 w-full min-h-12 px-4 py-3 rounded-lg border-[1.5px] border-input bg-input-background text-ink";

const Field = ({ label, name, type = "text", autoComplete, textarea = false }: { label: string; name: string; type?: string; autoComplete?: string; textarea?: boolean }) => (
  <label className="block">
    <span className="text-ui font-bold text-ink">{label}<span className="text-danger" aria-hidden="true"> *</span></span>
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
    <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-10">
      <Card>
        {sent ? (
          <div className="py-10 text-center" role="status">
            <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-brand-soft text-brand"><Check aria-hidden="true" className="size-8" /></div>
            <h2 className="text-display-sm text-ink">Thanks for reaching out.</h2>
            <p className="mt-3 text-ui text-ink-soft">Your email app should have opened with your message. Send it, and we will get back to you.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-5">
            <h2 className="text-display-sm text-ink">Send us a note</h2>
            <p className="text-small text-ink-soft">Fields marked <span className="text-danger" aria-hidden="true">*</span><span className="sr-only">with an asterisk</span> are required. Sending opens your email app with the message filled in.</p>
            <div className="grid gap-5 sm:grid-cols-2"><Field label="First name" name="first" autoComplete="given-name" /><Field label="Last name" name="last" autoComplete="family-name" /></div>
            <Field label="Email" name="email" type="email" autoComplete="email" />
            <label className="block"><span className="text-ui font-bold text-ink">I am a<span className="text-danger" aria-hidden="true"> *</span></span>
              <select name="role" required className={control}>
                <option value="">Choose one</option><option>Teacher or school administrator</option><option>Parent</option><option>Student (grades 9-12)</option><option>Potential partner or sponsor</option><option>Volunteer</option><option>Other</option>
              </select>
            </label>
            <Field label="Message" name="message" textarea />
            <button type="submit" className={cn(buttonVariants({ size: "lg" }), "justify-self-start")}>Send message <Send aria-hidden="true" /></button>
          </form>
        )}
      </Card>

      <div className="grid gap-5">
        <Card>
          <Eyebrow className="flex items-center gap-2"><Mail aria-hidden="true" className="size-4" />Email</Eyebrow>
          {/* Let a long address wrap after the @, never mid-word. */}
          <a href={`mailto:${ORG.email}`} className="mt-2 block break-words rounded-sm font-display text-title font-semibold text-ink underline decoration-brand/50 decoration-2 underline-offset-4 hover:text-brand hover:decoration-brand">{ORG.email.split("@")[0]}@<wbr />{ORG.email.split("@")[1]}</a>
        </Card>
        <div id="newsletter" className="rounded-xl bg-brand-soft p-6 sm:p-8">
          <Eyebrow>Mailing list</Eyebrow>
          <CardTitle as="h2" className="mt-1">Join our community</CardTitle>
          <p className="mt-2 text-ui text-ink">Updates, new resources, and upcoming workshops. A few emails a year, nothing more.</p>
          {subscribed ? (
            <p role="status" className="mt-5 flex items-center gap-2 font-bold text-brand"><Check aria-hidden="true" className="size-5" /> Your email app should open. Send the message to join.</p>
          ) : (
            <form onSubmit={subscribe} className="mt-5">
              <label htmlFor="newsletter-email" className="text-ui font-bold text-ink">Email address</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input id="newsletter-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-11 w-full min-w-0 rounded-full sm:flex-1 border-[1.5px] border-input bg-surface px-4 text-ink placeholder:text-ink-faint" />
                <button type="submit" className={buttonVariants()}>Join</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
