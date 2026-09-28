import { ArrowRight, BadgeCheck, Hourglass, PencilLine } from "lucide-react";
import { Badge, badgeVariants } from "../ui/badge";
import { cn } from "../ui/utils";

export type ReviewStatus = "draft" | "in-review" | "reviewed";
export type Reviewer = { name: string; credentials?: string };

const REVIEW_PAGE = "/about#reviewers";

const COPY = {
  draft: { Icon: PencilLine, short: "Draft", full: "Draft: under expert review" },
  "in-review": { Icon: Hourglass, short: "In review", full: "In review with an expert" },
  reviewed: { Icon: BadgeCheck, short: "Reviewed", full: "Reviewed" },
} as const;

/** "A", "A and B", "A, B, and C", or "A, B, and 2 others". */
export function listNames(names: string[], max = 3) {
  if (names.length <= 2) return names.join(" and ");
  if (names.length <= max) return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
  const rest = names.length - (max - 1);
  return `${names.slice(0, max - 1).join(", ")}, and ${rest} others`;
}

type Props = {
  status: ReviewStatus;
  reviewers?: Reviewer[];
  /** compact: syllabus rows and cards. full: module pages, with names and a link to how review works. */
  size?: "compact" | "full";
  className?: string;
};

/**
 * Honest review status for a module (brief section 5). Drafts say so plainly; reviewed
 * modules name their reviewers and link to /about#reviewers. Renders no JavaScript.
 */
export function ReviewBadge({ status, reviewers = [], size = "compact", className }: Props) {
  const { Icon, short, full } = COPY[status];

  if (size === "compact") {
    return (
      <Badge variant={status} className={className}>
        <Icon aria-hidden="true" />
        <span className="sr-only">Review status: </span>
        {short}
      </Badge>
    );
  }

  if (status === "reviewed" && reviewers.length > 0) {
    const names = listNames(reviewers.map((r) => r.name));
    return (
      <a
        href={REVIEW_PAGE}
        aria-label={`Reviewed by ${names}. About our reviewers`}
        className={cn(
          badgeVariants({ variant: "reviewed" }),
          "group min-h-9 whitespace-normal py-1.5 text-left leading-snug transition-colors duration-[var(--dur)] hover:border-brand/60",
          className,
        )}
      >
        <Icon aria-hidden="true" />
        <span>Reviewed by {names}</span>
        <ArrowRight aria-hidden="true" className="transition-transform duration-[var(--dur)] group-hover:translate-x-0.5" />
      </a>
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      <Badge variant={status} className="min-h-9 py-1.5">
        <Icon aria-hidden="true" />
        {full}
      </Badge>
      <a href={REVIEW_PAGE} className="rounded-sm text-small font-bold text-brand underline decoration-1 underline-offset-4 hover:decoration-2">
        How we review modules
      </a>
    </span>
  );
}
