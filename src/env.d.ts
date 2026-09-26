/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by the lesson step page for MDX components (see src/lib/lesson-types.ts). */
    lesson?: import("./lib/lesson-types").LessonContext;
    /** The verified signed-in user (src/middleware.ts), or null. Only on server-rendered requests. */
    user?: import("./lib/session").SessionUser | null;
  }
}

/** canvas-confetti ships no types; this is the one call the completion page makes (Completion.tsx). */
declare module "canvas-confetti" {
  type Options = { particleCount?: number; spread?: number; startVelocity?: number; origin?: { x?: number; y?: number }; colors?: string[]; disableForReducedMotion?: boolean };
  export default function confetti(options?: Options): Promise<null> | null;
}
