/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by the lesson step page for MDX components (see src/lib/lesson-types.ts). */
    lesson?: import("./lib/lesson-types").LessonContext;
    /** The verified signed-in user (src/middleware.ts), or null. Only on server-rendered requests. */
    user?: import("./lib/session").SessionUser | null;
  }
}
