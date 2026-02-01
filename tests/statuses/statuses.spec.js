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

test("Создание нового статуса", async ({ page }) => {
    await login(page);

    // Переходим к списку статусов задач
    await page.goto("/#/task_statuses");

    // Открываем форму создания: клик по ссылке Create (с иконкой AddIcon)
    await page.getByRole("link", { name: /create/i }).click();

    // Проверяем, что форма создания статуса отображается корректно
    const nameField = page.locator('input[name="name"]');
    const slugField = page.locator('input[name="slug"]');
    const saveButton = page.getByLabel("Save");

    await expect(nameField).toBeVisible();
    await expect(slugField).toBeVisible();
    await expect(saveButton).toBeVisible();

    // Вводим данные нового статуса (Name и Slug обязательны)
    const uniq = Date.now();
    const statusName = `Status ${uniq}`;
    const statusSlug = `status-${uniq}`;

    await nameField.fill(statusName);
    await slugField.fill(statusSlug);

    // Сохраняем
    await saveButton.click();

    // Проверяем, что данные сохранились: сообщение об успехе
    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });

    // Проверяем, что новый статус отображается в списке
    await page.goto("/#/task_statuses");
    const table = page.locator("#main-content table.RaDatagrid-table");
    await expect(table).toBeVisible({ timeout: 5000 });
    await expect(table).toContainText(statusName);
});

test("Просмотр списка статусов", async ({ page }) => {
    await login(page);

    // Переходим к списку статусов задач
    await page.goto("/#/task_statuses");

    // Проверяем, что список статусов отображается
    const table = page.locator("#main-content table.RaDatagrid-table");
    const emptyMessage = page.getByText(/No .* statuses? yet|No Task statuses yet/i);

    // Если список пуст — проверяем пустое состояние
    if (await emptyMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(emptyMessage).toBeVisible();
        return;
    }

    await expect(table).toBeVisible();

    // Получаем все строки со статусами
    const statusRows = table.locator("tbody tr");
    const rowCount = await statusRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Проверяем каждого статуса в списке: название и slug
    for (let i = 0; i < rowCount; i++) {
        const row = statusRows.nth(i);
        await expect(row).toBeVisible();

        // Проверяем наличие названия (Name) — ячейка с data-field="name" или первая колонка
        const nameCell = row.locator('[data-field="name"], td:first-of-type');
        await expect(nameCell.first()).toBeVisible({ timeout: 2000 });

        // Проверяем наличие slug — ячейка с data-field="slug" или вторая колонка
        const slugCell = row.locator('[data-field="slug"], td:nth-child(2)');
        await expect(slugCell.first()).toBeVisible({ timeout: 2000 });
    }

    // Проверяем заголовки колонок: Name и Slug
    const headers = table.locator("thead th");
    const headerCount = await headers.count();
    if (headerCount > 0) {
        const headerTexts = await headers.allTextContents();
        const hasName = headerTexts.some((t) => /name|название/i.test(t));
        const hasSlug = headerTexts.some((t) => /slug/i.test(t));
        expect(hasName || hasSlug).toBeTruthy();
    }
});

test("Редактирование информации о статусе", async ({ page }) => {
    await login(page);

    // Переходим к списку статусов задач
    await page.goto("/#/task_statuses");

    const table = page.locator("#main-content table.RaDatagrid-table");
    await expect(table).toBeVisible({ timeout: 5000 });

    const statusRows = table.locator("tbody tr");
    const rowCount = await statusRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Открываем форму редактирования: клик по первой строке
    const firstRow = statusRows.first();
    await firstRow.click();

    // Проверяем, что форма редактирования отображается правильно
    const nameField = page.locator('input[name="name"]');
    const slugField = page.locator('input[name="slug"]');
    const saveButton = page.getByLabel("Save");

    await expect(nameField).toBeVisible();
    await expect(slugField).toBeVisible();
    await expect(saveButton).toBeVisible();

    // Меняем данные статуса
    const uniq = Date.now();
    const newName = `Updated Status ${uniq}`;
    const newSlug = `updated-status-${uniq}`;

    await nameField.clear();
    await nameField.fill(newName);
    await slugField.clear();
    await slugField.fill(newSlug);

    // Сохраняем изменения
    await saveButton.click();

    // Проверяем сообщение об успешном сохранении
    await expect(page.getByText("Element updated")).toBeVisible({ timeout: 10000 });

    // Проверяем, что изменения отображаются в списке
    await page.goto("/#/task_statuses");
    await expect(table).toBeVisible({ timeout: 5000 });
    await expect(table).toContainText(newName);
    await expect(table).toContainText(newSlug);
});

test("Удаление статуса", async ({ page }) => {
    await login(page);

    // Создаём статус для удаления
    await page.goto("/#/task_statuses");
    await page.getByRole("link", { name: /create/i }).click();

    const uniq = Date.now();
    const statusName = `To Delete ${uniq}`;
    const statusSlug = `to-delete-${uniq}`;

    await page.locator('input[name="name"]').fill(statusName);
    await page.locator('input[name="slug"]').fill(statusSlug);
    await page.getByLabel("Save").click();
    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });

    // Возвращаемся к списку статусов
    await page.goto("/#/task_statuses");
    const table = page.locator("#main-content table.RaDatagrid-table");
    await expect(table).toBeVisible({ timeout: 5000 });

    // Выбираем созданный статус: строка с нашим названием, чекбокс в строке
    const userRow = table.locator("tbody tr", { hasText: statusName });
    await expect(userRow).toBeVisible({ timeout: 5000 });
    await userRow.locator('input[type="checkbox"]').click();

    // Нажимаем Delete
    await page.getByLabel("Delete").click();

    // Подтверждение удаления (если есть диалог)
    const confirmButton = page.getByRole("button", { name: /confirm|удалить|да|yes/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
    }

    // Проверяем сообщение об успешном удалении (React Admin: «Element deleted»)
    await expect(page.getByText("Element deleted")).toBeVisible({ timeout: 10000 });

    // Проверяем, что статус удалён из списка
    await expect(table.locator("tbody tr", { hasText: statusName })).toHaveCount(0);
});

test("Удаление всех статусов", async ({ page }) => {
    //  Логинимся
    await login(page);

    // Открываем страницу Task statuses
    await page.getByTestId("MenuIcon").locator("..").click();
    await page.getByRole("menuitem", { name: /status/i }).first().click();

    // Убеждаемся, что страница загрузилась
    await expect(page.locator("#main-content")).toBeVisible();

    // Выделяем все статусы (кликаем по родителю чекбокса)
    const selectAll = page.getByLabel("Select all");
    await selectAll.locator("..").click();

    // Нажимаем Delete
    await page.getByLabel("Delete").click();

    // Проверяем, что список пустой
    await expect(
        page.getByText("No Task statuses yet.")
    ).toBeVisible({ timeout: 10000 });

});
