import {expect, test} from "@playwright/test";

const ADMIN = { username: "admin", password: "password" };

// Вспомогательная функция: логин в систему
async function login(page) {
    await page.goto("/");
    await page.locator('input[name="username"]').fill(ADMIN.username);
    await page.locator('input[name="password"]').fill(ADMIN.password);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText("Welcome to the administration")).toBeVisible();
}

test("Создание нового лейбла", async ({ page }) => {
    await login(page);

    await page.goto("/#/labels");
    await page.getByRole("link", { name: /create/i }).click();

    const nameField = page.locator('input[name="name"]');
    const saveButton = page.getByLabel("Save");

    await expect(nameField).toBeVisible();
    await expect(saveButton).toBeVisible();

    const uniq = Date.now();
    const labelName = `Label ${uniq}`;

    await nameField.fill(labelName);
    await saveButton.click();

    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });

    await page.goto("/#/labels");
    const table = page.locator("#main-content table.RaDatagrid-table");
    await expect(table).toBeVisible({ timeout: 5000 });
    await expect(table).toContainText(labelName);
});

test("Просмотр списка лейблов", async ({ page }) => {
    await login(page);

    await page.goto("/#/labels");

    const table = page.locator("#main-content table.RaDatagrid-table");
    const emptyMessage = page.getByText("No Labels yet.");

    if (await emptyMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(emptyMessage).toBeVisible();
        return;
    }

    await expect(table).toBeVisible();

    const labelRows = table.locator("tbody tr");
    const rowCount = await labelRows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
        const row = labelRows.nth(i);
        await expect(row).toBeVisible();

        const nameCell = row.locator('[data-field="name"], td:first-of-type');
        await expect(nameCell.first()).toBeVisible({ timeout: 2000 });
    }

    const headers = table.locator("thead th");
    const headerCount = await headers.count();
    if (headerCount > 0) {
        const headerTexts = await headers.allTextContents();
        const hasName = headerTexts.some((t) => /name|название/i.test(t));
        expect(hasName).toBeTruthy();
    }
});

test("Редактирование информации о лейбле", async ({ page }) => {
    await login(page);

    await page.goto("/#/labels");

    const table = page.locator("#main-content table.RaDatagrid-table");
    await expect(table).toBeVisible({ timeout: 5000 });

    const labelRows = table.locator("tbody tr");
    const rowCount = await labelRows.count();
    expect(rowCount).toBeGreaterThan(0);

    const firstRow = labelRows.first();
    await firstRow.click();

    const nameField = page.locator('input[name="name"]');
    const saveButton = page.getByLabel("Save");

    await expect(nameField).toBeVisible();
    await expect(saveButton).toBeVisible();

    const uniq = Date.now();
    const newName = `Updated Label ${uniq}`;

    await nameField.clear();
    await nameField.fill(newName);

    await saveButton.click();

    await expect(page.getByText("Element updated")).toBeVisible({ timeout: 10000 });

    await page.goto("/#/labels");
    await expect(table).toBeVisible({ timeout: 5000 });
    await expect(table).toContainText(newName);
});

test("Удаление лейбла", async ({ page }) => {
    await login(page);

    await page.goto("/#/labels");
    await page.getByRole("link", { name: /create/i }).click();

    const uniq = Date.now();
    const labelName = `To Delete ${uniq}`;

    await page.locator('input[name="name"]').fill(labelName);
    await page.getByLabel("Save").click();
    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });

    await page.goto("/#/labels");
    const table = page.locator("#main-content table.RaDatagrid-table");
    await expect(table).toBeVisible({ timeout: 5000 });

    const labelRow = table.locator("tbody tr", { hasText: labelName });
    await expect(labelRow).toBeVisible({ timeout: 5000 });
    await labelRow.locator('input[type="checkbox"]').click();

    await page.getByLabel("Delete").click();

    const confirmButton = page.getByRole("button", { name: /confirm|удалить|да|yes/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
    }

    await expect(page.getByText("Element deleted")).toBeVisible({ timeout: 10000 });

    await expect(table.locator("tbody tr", { hasText: labelName })).toHaveCount(0);
});

test("Удаление всех лейблов", async ({ page }) => {
    await login(page);

    await page.goto("/#/labels");

    const table = page.locator("#main-content table.RaDatagrid-table");
    const emptyMessage = page.getByText("No Labels yet.");

    // Если список уже пуст — проверяем пустое состояние
    if (await emptyMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(emptyMessage).toBeVisible();
        return;
    }

    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr");
    const countBefore = await rows.count();
    if (countBefore === 0) return;

    // Выбираем всех: чекбокс «Select all» в заголовке таблицы
    const selectAllCheckbox = page.getByRole("checkbox", { name: "Select all" });
    await selectAllCheckbox.click();

    // Нажимаем Delete
    await page.getByLabel("Delete").click();

    // Подтверждение (если есть диалог)
    const confirmButton = page.getByRole("button", { name: /confirm|удалить|да|yes/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
    }

    // Проверяем сообщение об удалении (массовое удаление — «Elements deleted»)
    const deletedMessage = page.locator(".MuiSnackbarContent-message").filter({ hasText: /deleted/i });
    await expect(deletedMessage).toBeVisible({ timeout: 10000 });

    // Проверяем пустое состояние списка
    await expect(emptyMessage).toBeVisible({ timeout: 10000 });
});
