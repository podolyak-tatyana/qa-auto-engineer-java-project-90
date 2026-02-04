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

test("Создание новой задачи", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);

    await page.goto("/#/tasks");
    await page.getByRole("link", { name: /create/i }).click();

    const titleField = page.locator('input[name="title"]');
    const contentField = page.locator('textarea[name="content"]');
    const saveButton = page.getByLabel("Save");

    await expect(titleField).toBeVisible();
    await expect(contentField).toBeVisible();
    await expect(saveButton).toBeVisible();

    const uniq = Date.now();
    const taskName = `Task ${uniq}`;
    const taskContent = `Description for task ${uniq}`;
    await titleField.fill(taskName);
    await contentField.fill(taskContent);

    // Assignee: первый combobox, выбираем emily@example.com
    const assigneeCombobox = page.getByRole("combobox").first();
    await assigneeCombobox.click();
    await page.getByRole("option", { name: "emily@example.com" }).click();

    // Status: второй combobox, выбираем To Publish
    const statusCombobox = page.getByRole("combobox").nth(1);
    await statusCombobox.click();
    await page.getByRole("option", { name: "To Publish" }).click();

    // Label: третий combobox — выбираем любое значение из списка
    const labelCombobox = page.getByRole("combobox").nth(2);
    await labelCombobox.click();
    await page.getByRole("option").first().click();

    // Закрываем выпадающий список (иначе он блокирует клик по Save)
    await page.keyboard.press("Escape");

    await saveButton.click();

    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });

    // Проверяем, что задача создана — ищем её на странице
    await page.goto("/#/tasks");
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 10000 });
    // Ищем заголовок задачи (точное совпадение, не описание)
    await expect(page.getByText(taskName, { exact: true })).toBeVisible({ timeout: 15000 });
});

test("Редактирование задачи", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);

    await page.goto("/#/tasks");
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 10000 });

    // Открываем форму редактирования: клик по кнопке Edit первой задачи
    await page.getByRole("link", { name: "Edit" }).first().click();

    // Проверяем, что форма редактирования отображается
    const titleField = page.locator('input[name="title"]');
    const contentField = page.locator('textarea[name="content"]');
    const saveButton = page.getByLabel("Save");

    await expect(titleField).toBeVisible();
    await expect(contentField).toBeVisible();
    await expect(saveButton).toBeVisible();

    // Меняем данные задачи
    const uniq = Date.now();
    const newTitle = `Updated Task ${uniq}`;
    const newContent = `Updated description ${uniq}`;

    await titleField.clear();
    await titleField.fill(newTitle);
    await contentField.clear();
    await contentField.fill(newContent);

    await saveButton.click();

    await expect(page.getByText("Element updated")).toBeVisible({ timeout: 10000 });

    // Проверяем, что изменения отображаются
    await page.goto("/#/tasks");
    await expect(page.getByText(newTitle, { exact: true })).toBeVisible({ timeout: 15000 });
});

test("Просмотр списка задач (канбан-доска)", async ({ page }) => {
    await login(page);

    await page.goto("/#/tasks");

    // Проверяем, что страница со списком задач отображается
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({ timeout: 10000 });

    // Проверяем наличие колонок статусов канбан-доски
    await expect(page.getByRole("heading", { name: "Draft" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "To Review" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "To Be Fixed" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "To Publish" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Published" })).toBeVisible();

    // Проверяем кнопку создания задачи
    await expect(page.getByRole("link", { name: /create/i })).toBeVisible();

    // Проверяем, что отображаются карточки задач (кнопки Edit)
    await expect(page.getByRole("link", { name: "Edit" }).first()).toBeVisible({ timeout: 5000 });
});

test("Удаление задачи", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);

    // Создаём задачу для удаления
    await page.goto("/#/tasks");
    await page.getByRole("link", { name: /create/i }).click();

    const uniq = Date.now();
    const taskName = `To Delete ${uniq}`;
    const taskContent = `Description to delete ${uniq}`;

    await page.locator('input[name="title"]').fill(taskName);
    await page.locator('textarea[name="content"]').fill(taskContent);

    const assigneeCombobox = page.getByRole("combobox").first();
    await assigneeCombobox.click();
    await page.getByRole("option", { name: "emily@example.com" }).click();

    const statusCombobox = page.getByRole("combobox").nth(1);
    await statusCombobox.click();
    await page.getByRole("option", { name: "To Publish" }).click();

    const labelCombobox = page.getByRole("combobox").nth(2);
    await labelCombobox.click();
    await page.getByRole("option").first().click();
    await page.keyboard.press("Escape");

    await page.getByLabel("Save").click();
    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });

    // Возвращаемся к списку и находим Edit для нашей задачи (карточка — button с текстом задачи)
    await page.goto("/#/tasks");
    const taskCard = page.getByRole("button").filter({ hasText: taskName });
    await expect(taskCard).toBeVisible({ timeout: 10000 });
    await taskCard.getByRole("link", { name: "Edit" }).click();

    await page.getByLabel("Delete").click();

    // Подтверждение удаления (если есть диалог)
    const confirmButton = page.getByRole("button", { name: /confirm|удалить|да|yes/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
    }

    await expect(page.getByText("Element deleted")).toBeVisible({ timeout: 10000 });

    // Проверяем, что задачи больше нет
    await page.goto("/#/tasks");
    await expect(page.getByText(taskName, { exact: true })).not.toBeVisible({ timeout: 5000 });
});

test("Фильтрация задач", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);

    await page.goto("/#/tasks");
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({ timeout: 10000 });

    // Фильтр по Status: выбираем Draft
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Draft" }).click();

    // Проверяем, что колонка Draft отображается и в ней есть задачи
    await expect(page.getByRole("heading", { name: "Draft" })).toBeVisible();
    const draftColumn = page.getByRole("heading", { name: "Draft" }).locator("../..");
    await expect(draftColumn.getByRole("button").first()).toBeVisible({ timeout: 5000 });

    // Фильтр по Assignee: выбираем исполнителя (если есть задачи — проверяем)
    await page.getByRole("combobox", { name: "Assignee" }).click();
    await page.getByRole("option", { name: /@/ }).first().click();

    // Проверяем, что страница отображается (задачи могут быть или пусто)
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
});


test("Перемещение задачи между колонками", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);

    await page.goto("/#/tasks");
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({ timeout: 10000 });

    // Находим первую задачу в колонке Draft (кнопка-карточка)
    const draftHeading = page.getByRole("heading", { name: "Draft" });
    const draftColumn = draftHeading.locator("../..");
    const firstTaskInDraft = draftColumn.getByRole("button").first();
    await expect(firstTaskInDraft).toBeVisible({ timeout: 5000 });

    // Извлекаем название задачи (первое слово типа "Task 11")
    const fullText = await firstTaskInDraft.textContent();
    const taskTitle = fullText?.split(/\s/).slice(0, 2).join(" ") || ""; // "Task 11"

    // Целевая колонка — To Review
    const toReviewHeading = page.getByRole("heading", { name: "To Review" });
    const toReviewColumn = toReviewHeading.locator("../..");

    // Перетаскиваем задачу из Draft в To Review
    await firstTaskInDraft.dragTo(toReviewColumn);

    // Проверяем, что задача появилась в колонке To Review
    await expect(toReviewColumn.getByText(taskTitle)).toBeVisible({ timeout: 5000 });
});

