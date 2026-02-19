import { test as base, expect } from "@playwright/test";
import { saveCoverage } from "./coverage-utils.js";

const test = base.extend({
    page: async ({ page }, use) => {
        await use(page);
        if (process.env.COVERAGE) {
            try {
                const cov = await page.evaluate(() => window.__coverage__);
                if (cov) saveCoverage(cov);
            } catch (_) {}
        }
    },
});

export { test, expect };
