// Start every test run from empty emulators (never production: the project is demo-ark).
import { EMULATORS } from "../scripts/test-env.mjs";

export default async function globalSetup() {
  const wipe = async (url: string) => {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error(`Couldn't reset the emulator (${res.status}). Are the Firebase emulators running? Use npm test.`);
  };
  await wipe(`http://${EMULATORS.auth}/emulator/v1/projects/demo-ark/accounts`);
  await wipe(`http://${EMULATORS.firestore}/emulator/v1/projects/demo-ark/databases/(default)/documents`);
}
