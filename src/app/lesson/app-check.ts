// Loaded only with import() by the progress store, the first time it saves something, so pages
// that just show progress never download the Firebase SDK and reCAPTCHA. (Nothing may import this
// statically, or the bundler would pull the SDK back into those pages.)
export { appCheckHeaders } from "../../lib/firebase-client";
