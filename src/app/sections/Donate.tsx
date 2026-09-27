import { useRef, useState } from "react";
import { Heart, ShieldCheck } from "lucide-react";
import { ORG } from "../lib/content";
import { Card, CardTitle, Btn } from "../components/site/Primitives";
import { buttonVariants } from "../components/ui/button";
import { useEarlyInput } from "../components/ui/use-hydration";
import { cn } from "../components/ui/utils";

const amounts = [25, 50, 100, 250];

/** Island: gift amount picker. Donations go by email until a processor is chosen. */
export function DonatePanel() {
  const [amt, setAmt] = useState<number | null>(50);
  const [custom, setCustom] = useState("");
  const customRef = useRef<HTMLInputElement>(null);
  useEarlyInput(customRef, custom, (el) => setCustom(el.value.replace(/[^0-9]/g, "")));
  const value = custom ? Number(custom) : amt;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-10">
      <Card>
        <div className="mb-6 flex items-center gap-3"><Heart aria-hidden="true" className="size-6 text-brand" /><h2 className="text-display-sm text-ink">Make a gift</h2></div>
        <div role="group" aria-label="Choose an amount" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {amounts.map((a) => {
            const selected = amt === a && !custom;
            return (
              <button key={a} type="button" aria-pressed={selected} onClick={() => { setAmt(a); setCustom(""); }}
                className={cn("min-h-12 rounded-lg border-[1.5px] py-3 font-display text-title font-semibold transition-colors duration-[var(--dur)]", selected ? "border-brand bg-brand text-brand-ink" : "border-input bg-surface text-ink hover:border-brand hover:bg-brand-soft")}>
                ${a}
              </button>
            );
          })}
        </div>
        <label className="mt-5 block">
          <span className="text-ui font-bold text-ink">Or enter an amount</span>
          <span className="relative mt-2 block">
            <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">$</span>
            <input ref={customRef} inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Custom" className="h-12 w-full rounded-lg border-[1.5px] border-input bg-input-background pl-9 pr-4 text-ink placeholder:text-ink-faint" />
          </span>
        </label>
        <a href={`mailto:${ORG.email}?subject=Donation${value ? " of $" + value : ""}`} className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}>
          Donate {value ? `$${value}` : ""}
        </a>
        <p className="mt-3 text-center text-small text-ink-soft">This opens an email to our team. We will reply with how to give.</p>
        <p className="mt-4 flex items-start justify-center gap-2 text-small text-ink-soft"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" /> 501(c)(3) nonprofit. Gifts are tax-deductible to the extent allowed by law.</p>
      </Card>

      <div className="grid gap-5">
        <Card>
          <CardTitle>Where the money goes</CardTitle>
          <dl className="mt-4 grid gap-3">
            {[["50%", "Programs: curriculum, workshops, facilitator training"], ["25%", "Operations: staffing, technology, compliance"], ["15%", "Marketing: content, social, event outreach"], ["10%", "Reserve: emergency and growth fund"]].map(([p, d]) => (
              <div key={p} className="flex items-baseline gap-4"><dt className="w-12 shrink-0 font-display text-title font-semibold text-brand">{p}</dt><dd className="text-ui text-ink-soft">{d}</dd></div>
            ))}
          </dl>
        </Card>
        <Card>
          <CardTitle>Corporate or foundation?</CardTitle>
          <p className="mt-2 text-ui text-ink-soft">Explore our partnership tiers, from Community Supporter to Founding Partner with a board advisory seat.</p>
          <Btn to="/get-involved#partners" variant="outline" className="mt-5" arrow>See partnership tiers</Btn>
        </Card>
      </div>
    </div>
  );
}
