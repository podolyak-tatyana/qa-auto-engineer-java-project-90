import { expect } from "@playwright/test";

// Учётные данные для тестового окружения (Security Hotspot: не продакшен)
const ADMIN = {
    username: process.env.PLAYWRIGHT_TEST_USERNAME || "admin",
    password: process.env.PLAYWRIGHT_TEST_PASSWORD || "password",
};

/** Логин в систему */
export async function login(page) {
    await page.goto("/");
    await page.locator('input[name="username"]').fill(ADMIN.username);
    await page.locator('input[name="password"]').fill(ADMIN.password);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText("Welcome to the administration")).toBeVisible();
}

export { ADMIN };
