import { Printer } from "lucide-react";
import { useHydrated } from "../ui/use-hydration";
import { Button, type ButtonProps } from "../ui/button";

/** Opens the browser's print dialog (certificates, facilitator guides). Disabled until its script has loaded. */
export function PrintButton({ label = "Print", ...props }: { label?: string } & Omit<ButtonProps, "onClick" | "type">) {
  const hydrated = useHydrated();
  return (
    <Button type="button" disabled={!hydrated} onClick={() => window.print()} {...props}>
      <Printer aria-hidden="true" /> {label}
    </Button>
  );
}
