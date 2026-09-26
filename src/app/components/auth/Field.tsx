import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../ui/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; error?: string | null };

/** A labeled text input with an optional hint and error, wired up for screen readers. */
export function Field({ label, hint, error, className, type = "text", ...input }: Props) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isPassword = type === "password";
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-ui font-bold text-ink">{label}</label>
      {hint && <p id={`${id}-hint`} className="text-small text-ink-soft">{hint}</p>}
      <div className="relative">
        <input
          id={id}
          type={isPassword && shown ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full rounded-lg border-[1.5px] bg-surface px-3.5 text-ui text-ink placeholder:text-ink-faint",
            error ? "border-danger" : "border-input focus-visible:border-brand",
            isPassword && "pr-12",
          )}
          {...input}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown(!shown)}
            aria-pressed={shown}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-ink-soft hover:text-ink"
          >
            {shown ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
            <span className="sr-only">{shown ? "Hide password" : "Show password"}</span>
          </button>
        )}
      </div>
      {error && <p id={`${id}-error`} className="text-small font-bold text-danger">{error}</p>}
    </div>
  );
}

type SelectProps = { label: string; hint?: string; value: string; onChange: (v: string) => void; options: readonly { id: string; label: string }[]; placeholder: string; name?: string; required?: boolean };

export function SelectField({ label, hint, value, onChange, options, placeholder, name, required }: SelectProps) {
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-ui font-bold text-ink">{label}</label>
      {hint && <p id={`${id}-hint`} className="text-small text-ink-soft">{hint}</p>}
      <select
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="h-11 w-full rounded-lg border-[1.5px] border-input bg-surface px-3 text-ui text-ink"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

/** Form-level message. Errors are announced right away; other notes politely. */
export function Notice({ kind = "info", children, id }: { kind?: "info" | "error" | "success"; children: ReactNode; id?: string }) {
  return (
    <div
      id={id}
      role={kind === "error" ? "alert" : "status"}
      tabIndex={-1}
      className={cn(
        "rounded-lg border p-3.5 text-ui",
        kind === "error" && "border-danger/40 bg-[color-mix(in_srgb,var(--danger)_7%,white)] text-ink",
        kind === "success" && "border-brand/30 bg-brand-soft text-ink",
        kind === "info" && "border-line bg-surface-2 text-ink",
      )}
    >
      {children}
    </div>
  );
}

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-small text-ink-soft">
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
      {children}
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
    </div>
  );
}

/** "Continue with Google", with Google's standard mark as its brand guidelines ask. */
export function GoogleButton({ onClick, disabled, busy }: { onClick: () => void; disabled?: boolean; busy?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-input bg-surface px-6 text-ui font-bold text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
    >
      <svg viewBox="0 0 48 48" aria-hidden="true" className="size-5">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
      </svg>
      {busy ? "Opening Google..." : "Continue with Google"}
    </button>
  );
}
