import { coverageGlobalTeardown } from "./coverage-utils.js";

export default async function globalTeardown() {
    await coverageGlobalTeardown();
}
