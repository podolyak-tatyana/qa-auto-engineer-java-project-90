import { test, expect } from "@playwright/test";

test("login and logout", async ({ page }) => {
    // 1) Открываем приложение (если baseURL задан в playwright.config.ts — можно page.goto("/"))
    await page.goto("/");

    // 2) Логин
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("password");

    // Кнопка submit с текстом Sign in
    await page.getByRole("button", { name: /^sign in$/i }).click();

    // ✅ проверяем что реально вошли
    await expect(page.getByText("Welcome to the administration")).toBeVisible();

    await page.getByRole("button", { name: "Profile" }).click();
    await page.locator('li:has-text("Logout")').click();
    await expect(page.locator('input[name="username"]')).toBeVisible();
});
