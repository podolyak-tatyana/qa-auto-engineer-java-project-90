import { expect, test } from "../fixtures.js";
import {login} from "../helpers/auth.js";
import {LabelsPage} from "../pages/LabelsPage.js";

test("Создание нового лейбла", async ({ page }) => {
    await login(page);
    const labelsPage = new LabelsPage(page);

    const uniq = Date.now();
    const labelName = `Label ${uniq}`;

    await labelsPage.goto();
    await labelsPage.create(labelName);

    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });
    await labelsPage.goto();
    await expect(labelsPage.getTable()).toContainText(labelName);
});

test("Просмотр списка лейблов", async ({ page }) => {
    await login(page);
    const labelsPage = new LabelsPage(page);

    await labelsPage.goto();

    if (await page.getByText("No Labels yet.").isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(page.getByText("No Labels yet.")).toBeVisible();
        return;
    }

    const table = labelsPage.getTable();
    await expect(table).toBeVisible();
    expect(await table.locator("tbody tr").count()).toBeGreaterThan(0);
});

test("Редактирование информации о лейбле", async ({ page }) => {
    await login(page);
    const labelsPage = new LabelsPage(page);

    const uniq = Date.now();
    const newName = `Updated Label ${uniq}`;

    await labelsPage.goto();
    await labelsPage.getTable().locator("tbody tr").first().click();

    const nameField = page.locator('input[name="name"]');
    await nameField.clear();
    await nameField.fill(newName);
    await page.getByLabel("Save").click();

    await expect(page.getByText("Element updated")).toBeVisible({ timeout: 10000 });
    await labelsPage.goto();
    await expect(labelsPage.getTable()).toContainText(newName);
});

test("Удаление лейбла", async ({ page }) => {
    await login(page);
    const labelsPage = new LabelsPage(page);

    const uniq = Date.now();
    const labelName = `To Delete ${uniq}`;

    await labelsPage.goto();
    await labelsPage.create(labelName);
    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });

    await labelsPage.goto();
    await labelsPage.selectRowByText(labelName);
    await labelsPage.delete();
    await labelsPage.confirmDialog();

    await expect(page.getByText("Element deleted")).toBeVisible({ timeout: 10000 });
    await expect(labelsPage.getTable().locator("tbody tr", { hasText: labelName })).toHaveCount(0);
});

test("Удаление всех лейблов", async ({ page }) => {
    await login(page);
    const labelsPage = new LabelsPage(page);

    await labelsPage.goto();

    if (await page.getByText("No Labels yet.").isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(page.getByText("No Labels yet.")).toBeVisible();
        return;
    }

    const table = labelsPage.getTable();
    await expect(table).toBeVisible();
    if ((await table.locator("tbody tr").count()) === 0) return;

    await labelsPage.selectAll();
    await labelsPage.delete();
    await labelsPage.confirmDialog();

    const deletedMsg = page.locator(".MuiSnackbarContent-message").filter({ hasText: /deleted/i });
    await expect(deletedMsg).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("No Labels yet.")).toBeVisible({ timeout: 10000 });
});
