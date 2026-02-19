import { test, expect } from "./fixtures.js";
import { ADMIN } from "./helpers/auth.js";

test("login and logout", async ({ page }) => {
    await page.goto("/");

    await page.locator('input[name="username"]').fill(ADMIN.username);
    await page.locator('input[name="password"]').fill(ADMIN.password);

    // Кнопка submit с текстом Sign in
    await page.getByRole("button", { name: /^sign in$/i }).click();

    // проверяем что вошли
    await expect(page.getByText("Welcome to the administration")).toBeVisible();

    await page.getByRole("button", { name: "Profile" }).click();
    await page.locator('li:has-text("Logout")').click();
    await expect(page.locator('input[name="username"]')).toBeVisible();
});
