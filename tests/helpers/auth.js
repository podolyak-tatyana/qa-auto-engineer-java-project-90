import {expect} from "@playwright/test";

const ADMIN = { username: "admin", password: "password" };

/** Логин в систему */
export async function login(page) {
    await page.goto("/");
    await page.locator('input[name="username"]').fill(ADMIN.username);
    await page.locator('input[name="password"]').fill(ADMIN.password);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText("Welcome to the administration")).toBeVisible();
}

export { ADMIN };
