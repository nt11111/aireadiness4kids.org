import { useState } from "react";
import { Heart, Check, ShieldCheck } from "lucide-react";
import { ORG } from "../lib/content";
import { PageHero } from "../components/site/PageHero";
import { Section, Card, Btn } from "../components/site/Primitives";

const amounts = [25, 50, 100, 250];
const uses = [
  ["$25", "Prints facilitator kits for one classroom workshop"],
  ["$50", "Covers materials for a bilingual Parent Information Night"],
  ["$100", "Trains one Student Ambassador to reach hundreds of peers"],
  ["$250", "Funds a full-day immersive workshop at a Title I school"],
];

export default function Donate() {
  const [amt, setAmt] = useState<number | null>(50);
  const [custom, setCustom] = useState("");
  const value = custom ? Number(custom) : amt;

  return (
    <>
      <PageHero crumb="Donate" eyebrow="Support ARK" title="Keep AI literacy free for every kid."
        lead="All curriculum and core programs are free to students and schools, and they always will be. Your gift funds curriculum development, free workshops, and facilitator training in the communities that need it most." />

      <Section>
        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-start">
          <Card hover={false} className="!p-10 reveal">
            <div className="flex items-center gap-3 mb-6"><Heart className="text-accent" /><h2 className="font-display text-3xl font-black text-primary">Make a gift</h2></div>
            <div className="grid grid-cols-4 gap-3">
              {amounts.map((a) => (
                <button key={a} onClick={() => { setAmt(a); setCustom(""); }} className={`py-4 rounded-xl font-display font-black text-xl border transition-all ${amt === a && !custom ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-card text-primary border-border hover:border-accent"}`}>${a}</button>
              ))}
            </div>
            <label className="block mt-4">
              <span className="text-sm font-semibold text-primary">Or enter an amount</span>
              <div className="relative mt-2"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                <input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Custom" className="w-full pl-9 pr-4 py-3.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" /></div>
            </label>
            <a href={`mailto:${ORG.email}?subject=Donation${value ? " of $" + value : ""}`} className="sheen mt-6 w-full inline-flex justify-center items-center gap-2 bg-accent text-white py-4 rounded-full font-bold text-[15px] hover:bg-accent/90 hover:scale-[1.02] transition-all shadow-lg shadow-accent/25">
              Donate {value ? `$${value}` : ""}
            </a>
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4"><ShieldCheck size={14} className="text-accent" /> 501(c)(3) nonprofit. Gifts are tax-deductible to the extent allowed by law.</p>
          </Card>

          <div className="grid gap-4">
            <div className="reveal d1 rounded-2xl bg-primary text-white p-8 relative overflow-hidden">
              <div className="absolute inset-0 circuit-grid opacity-[0.05]" />
              <img src="/brand/ark-mark-web.png" alt="" aria-hidden className="absolute -right-6 -bottom-6 w-40 opacity-[0.14]" />
              <div className="relative"><h3 className="font-display text-2xl font-black">What your gift does</h3>
                <ul className="grid gap-3 mt-5">{uses.map(([a, d]) => <li key={a} className="flex gap-3 text-white/80 text-[15px]"><span className="font-display font-black text-glow w-12 shrink-0">{a}</span>{d}</li>)}</ul></div>
            </div>
            <Card className="reveal d2"><h3 className="font-display text-xl font-black text-primary mb-3">Where the money goes</h3>
              <ul className="grid gap-2">{[["50%", "Programs: curriculum, workshops, facilitator training"], ["25%", "Operations: staffing, technology, compliance"], ["15%", "Marketing: content, social, event outreach"], ["10%", "Reserve: emergency and growth fund"]].map(([p, d]) => (
                <li key={p} className="flex gap-3 items-center text-[15px] text-foreground/80"><span className="font-mono font-bold text-accent w-12">{p}</span>{d}</li>))}</ul></Card>
            <Card className="reveal d3"><h3 className="font-display text-xl font-black text-primary mb-2">Corporate or foundation?</h3><p className="text-muted-foreground text-[15px]">Explore our partnership tiers, from Community Supporter to Founding Partner with a board advisory seat.</p><Btn to="/get-involved#partners" variant="ghost" className="mt-4" arrow>See partnership tiers</Btn></Card>
          </div>
        </div>
      </Section>
    </>
  );
}
