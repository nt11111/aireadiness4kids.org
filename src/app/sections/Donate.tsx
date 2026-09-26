import { useRef, useState } from "react";
import { Heart, ShieldCheck } from "lucide-react";
import { ORG } from "../lib/content";
import { Card, Btn } from "../components/site/Primitives";
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
    <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-start">
      <Card hover={false} className="!p-10 reveal">
        <div className="flex items-center gap-3 mb-6"><Heart aria-hidden="true" className="text-brand" /><h2 className="font-display text-3xl font-black text-ink">Make a gift</h2></div>
        <div role="group" aria-label="Choose an amount" className="grid grid-cols-4 gap-3">
          {amounts.map((a) => {
            const selected = amt === a && !custom;
            return (
              <button key={a} type="button" aria-pressed={selected} onClick={() => { setAmt(a); setCustom(""); }}
                className={cn("py-4 rounded-xl font-display font-black text-xl border-[1.5px] transition-colors duration-[var(--dur)]", selected ? "bg-ink text-white border-ink shadow-1" : "bg-card text-ink border-input hover:border-brand")}>
                ${a}
              </button>
            );
          })}
        </div>
        <label className="block mt-4">
          <span className="text-sm font-semibold text-ink">Or enter an amount</span>
          <div className="relative mt-2">
            <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
            <input ref={customRef} inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Custom" className="w-full pl-9 pr-4 py-3.5 rounded-xl border-[1.5px] border-input bg-input-background placeholder:text-ink-faint" />
          </div>
        </label>
        <a href={`mailto:${ORG.email}?subject=Donation${value ? " of $" + value : ""}`} className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}>
          Donate {value ? `$${value}` : ""}
        </a>
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4"><ShieldCheck size={14} aria-hidden="true" className="text-brand" /> 501(c)(3) nonprofit. Gifts are tax-deductible to the extent allowed by law.</p>
      </Card>

      <div className="grid gap-4">
        <Card className="reveal d1"><h3 className="font-display text-xl font-black text-ink mb-3">Where the money goes</h3>
          <ul className="grid gap-2">{[["50%", "Programs: curriculum, workshops, facilitator training"], ["25%", "Operations: staffing, technology, compliance"], ["15%", "Marketing: content, social, event outreach"], ["10%", "Reserve: emergency and growth fund"]].map(([p, d]) => (
            <li key={p} className="flex gap-3 items-center text-[15px] text-foreground/80"><span className="font-mono font-bold text-brand w-12">{p}</span>{d}</li>))}</ul></Card>
        <Card className="reveal d2"><h3 className="font-display text-xl font-black text-ink mb-2">Corporate or foundation?</h3><p className="text-muted-foreground text-[15px]">Explore our partnership tiers, from Community Supporter to Founding Partner with a board advisory seat.</p><Btn to="/get-involved#partners" variant="ghost" className="mt-4" arrow>See partnership tiers</Btn></Card>
      </div>
    </div>
  );
}
