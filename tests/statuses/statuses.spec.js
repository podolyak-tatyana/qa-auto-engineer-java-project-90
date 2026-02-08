import {expect, test} from "@playwright/test";
import {login} from "../helpers/auth.js";
import {StatusesPage} from "../pages/StatusesPage.js";

test("Создание нового статуса", async ({ page }) => {
    await login(page);
    const statusesPage = new StatusesPage(page);

    const uniq = Date.now();
    const statusName = `Status ${uniq}`;
    const statusSlug = `status-${uniq}`;

    await statusesPage.goto();
    await statusesPage.create(statusName, statusSlug);

    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });
    await statusesPage.goto();
    await expect(statusesPage.getTable()).toContainText(statusName);
});

test("Просмотр списка статусов", async ({ page }) => {
    await login(page);
    const statusesPage = new StatusesPage(page);

    await statusesPage.goto();

    if (await page.getByText(/No .* statuses? yet/i).isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(page.getByText(/No .* statuses? yet/i)).toBeVisible();
        return;
    }

    const table = statusesPage.getTable();
    await expect(table).toBeVisible();
    const rows = table.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);
});

test("Редактирование информации о статусе", async ({ page }) => {
    await login(page);
    const statusesPage = new StatusesPage(page);

    const uniq = Date.now();
    const newName = `Updated Status ${uniq}`;
    const newSlug = `updated-status-${uniq}`;

    await statusesPage.goto();
    await statusesPage.getTable().locator("tbody tr").first().click();

    const nameField = page.locator('input[name="name"]');
    const slugField = page.locator('input[name="slug"]');
    await nameField.clear();
    await nameField.fill(newName);
    await slugField.clear();
    await slugField.fill(newSlug);
    await page.getByLabel("Save").click();

    await expect(page.getByText("Element updated")).toBeVisible({ timeout: 10000 });
    await statusesPage.goto();
    await expect(statusesPage.getTable()).toContainText(newName);
});

test("Удаление статуса", async ({ page }) => {
    await login(page);
    const statusesPage = new StatusesPage(page);

    const uniq = Date.now();
    const statusName = `To Delete ${uniq}`;
    const statusSlug = `to-delete-${uniq}`;

    await statusesPage.goto();
    await statusesPage.create(statusName, statusSlug);
    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });

    await statusesPage.goto();
    await statusesPage.selectRowByText(statusName);
    await statusesPage.delete();
    await statusesPage.confirmDialog();

    await expect(page.getByText("Element deleted")).toBeVisible({ timeout: 10000 });
    await expect(statusesPage.getTable().locator("tbody tr", { hasText: statusName })).toHaveCount(0);
});

test("Удаление всех статусов", async ({ page }) => {
    await login(page);
    const statusesPage = new StatusesPage(page);

    await page.goto("/#/task_statuses");
    if (await page.locator("#main-content").count() === 0) return;

    await page.getByRole("checkbox", { name: "Select all" }).locator("..").click();
    await page.getByLabel("Delete").click();

    await expect(page.getByText("No Task statuses yet.")).toBeVisible({ timeout: 10000 });
});
