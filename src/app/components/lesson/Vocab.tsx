import { useId } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = { term: string; def: string; /** Text shown in the sentence, if it differs from the term (e.g. "biased"). */ label?: string };

/**
 * <Vocab>: a word in the text with a definition popover (brief section 6). It's a real button,
 * so it opens with a tap, a click, Enter, or Space, and Escape closes it.
 */
export function Vocab({ term, def, label }: Props) {
  const id = useId();
  return (
    <Popover>
      <PopoverTrigger className="rounded-sm font-bold text-ink underline decoration-brand decoration-dotted decoration-2 underline-offset-[5px] transition-colors hover:bg-brand-soft">
        {label ?? term}
        <span className="sr-only"> (show definition)</span>
      </PopoverTrigger>
      <PopoverContent aria-labelledby={`${id}-term`} className="w-72 max-w-[calc(100vw-2rem)] rounded-lg border-line bg-surface p-4 shadow-2" collisionPadding={16}>
        <p id={`${id}-term`} className="font-display text-title font-semibold text-ink">{term}</p>
        <p className="mt-1 text-ui text-ink">{def}</p>
      </PopoverContent>
    </Popover>
  );
}
