import { expect, test } from "../fixtures.js";
import {login} from "../helpers/auth.js";
import {UsersPage} from "../pages/UsersPage.js";

test("Создание нового пользователя", async ({page}) => {
    await login(page);
    const usersPage = new UsersPage(page);

    await usersPage.goto();
    await usersPage.openCreate();

    await page.locator('input[name="email"]').fill("tanya.test@example.com");
    await page.locator('input[name="firstName"]').fill("Tanya");
    await page.locator('input[name="lastName"]').fill("Pod");
    await page.getByLabel("Save").click();
});

test("Просмотр списка пользователей", async ({page}) => {
    await login(page);
    const usersPage = new UsersPage(page);

    await usersPage.goto();
    const table = usersPage.getTable();

    await expect(table).toBeVisible();
    const rows = table.locator("tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);

    const firstRow = rows.first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.locator('td:has-text("@")').first()).toBeVisible();
});

test("Редактирование информации о пользователе", async ({page}) => {
    await login(page);
    const usersPage = new UsersPage(page);

    await usersPage.goto();
    const table = usersPage.getTable();
    await table.locator("tbody tr").first().click();

    const uniq = Date.now();
    const newEmail = `updated.user+${uniq}@example.com`;
    const newFirstName = "UpdatedFirstName";
    const newLastName = "UpdatedLastName";

    await page.locator('input[name="email"]').clear();
    await page.locator('input[name="email"]').fill(newEmail);
    await page.locator('input[name="firstName"]').clear();
    await page.locator('input[name="firstName"]').fill(newFirstName);
    await page.locator('input[name="lastName"]').clear();
    await page.locator('input[name="lastName"]').fill(newLastName);
    await page.getByLabel("Save").click();

    await expect(page.getByText("Element updated")).toBeVisible({timeout: 5000});
    await usersPage.goto();
    await expect(page.getByText(newEmail)).toBeVisible({timeout: 5000});
});

test("Валидация данных при редактировании пользователя", async ({page}) => {
    await login(page);
    const usersPage = new UsersPage(page);

    await usersPage.goto();
    await usersPage.getTable().locator("tbody tr").first().click();

    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill("not-an-email");
    await page.getByLabel("Save").click();
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");

    const uniq = Date.now();
    await emailInput.fill(`tanya.edit+${uniq}@example.com`);
    await page.locator('input[name="firstName"]').fill(`Tanya${uniq}`);
    await page.locator('input[name="lastName"]').fill(`Pod${uniq}`);
    await page.getByLabel("Save").click();

    await expect(page.getByText("Element updated")).toBeVisible({timeout: 10000});
    await usersPage.goto();
    await expect(usersPage.getTable()).toContainText(`tanya.edit+${uniq}@example.com`);
});

test("Удаление созданного пользователя", async ({page}) => {
    await login(page);
    const usersPage = new UsersPage(page);

    const uniq = Date.now();
    const email = `qwertty.test+${uniq}@example.com`;

    await usersPage.goto();
    await usersPage.createUser(email, "Qwerty", "Qwert");
    await expect(page.getByText("Element created")).toBeVisible({timeout: 10000});

    await usersPage.goto();
    await usersPage.selectRowByText(email);
    await usersPage.delete();
    await usersPage.confirmDialog();

    await expect(page.getByText("Element deleted")).toBeVisible({timeout: 10000});
    await expect(usersPage.getTable().locator("tbody tr", {hasText: email})).toHaveCount(0);
});

test("Массовое удаление всех пользователей", async ({page}) => {
    await login(page);
    const usersPage = new UsersPage(page);

    await usersPage.goto();
    const table = usersPage.getTable();

    if (await page.getByText("No Users yet.").isVisible({timeout: 2000}).catch(() => false)) {
        await expect(page.getByText("No Users yet.")).toBeVisible();
        return;
    }

    await expect(table).toBeVisible();
    if ((await table.locator("tbody tr").count()) === 0) return;

    await usersPage.selectAll();
    await usersPage.delete();
    await usersPage.confirmDialog();

    // Snackbar с "Element deleted" исчезает быстро; главный индикатор успеха — пустой список
    await expect(page.getByText("No Users yet.")).toBeVisible({timeout: 10000});
});
