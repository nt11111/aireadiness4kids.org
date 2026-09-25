/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by the lesson step page for MDX components (see src/lib/lesson-types.ts). */
    lesson?: import("./lib/lesson-types").LessonContext;
  }
}
