import {expect, test} from "@playwright/test";
import {login} from "../helpers/auth.js";
import {TasksPage} from "../pages/TasksPage.js";

test("Создание новой задачи", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);
    const tasksPage = new TasksPage(page);

    const uniq = Date.now();
    const taskName = `Task ${uniq}`;
    const taskContent = `Description for task ${uniq}`;

    await tasksPage.goto();
    await tasksPage.create(taskName, taskContent);

    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });
    await tasksPage.goto();
    await expect(page.getByText(taskName, { exact: true })).toBeVisible({ timeout: 15000 });
});

test("Редактирование задачи", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);
    const tasksPage = new TasksPage(page);

    const uniq = Date.now();
    const newTitle = `Updated Task ${uniq}`;
    const newContent = `Updated description ${uniq}`;

    await tasksPage.goto();
    await page.getByRole("link", { name: "Edit" }).first().click();

    await page.locator('input[name="title"]').clear();
    await page.locator('input[name="title"]').fill(newTitle);
    await page.locator('textarea[name="content"]').clear();
    await page.locator('textarea[name="content"]').fill(newContent);
    await page.getByLabel("Save").click();

    await expect(page.getByText("Element updated")).toBeVisible({ timeout: 10000 });
    await tasksPage.goto();
    await expect(page.getByText(newTitle, { exact: true })).toBeVisible({ timeout: 15000 });
});

test("Просмотр списка задач (канбан-доска)", async ({ page }) => {
    await login(page);
    const tasksPage = new TasksPage(page);

    await tasksPage.goto();

    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Draft" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "To Review" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "To Publish" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Published" })).toBeVisible();
    await expect(page.getByRole("link", { name: /create/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit" }).first()).toBeVisible({ timeout: 5000 });
});

test("Удаление задачи", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);
    const tasksPage = new TasksPage(page);

    const uniq = Date.now();
    const taskName = `To Delete ${uniq}`;

    await tasksPage.goto();
    await tasksPage.create(taskName, `Description to delete ${uniq}`);
    await expect(page.getByText("Element created")).toBeVisible({ timeout: 10000 });

    await tasksPage.goto();
    await tasksPage.openEditByTaskName(taskName);
    await page.getByLabel("Delete").click();

    const confirmBtn = page.getByRole("button", { name: /confirm|удалить|да|yes/i });
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
    }

    await expect(page.getByText("Element deleted")).toBeVisible({ timeout: 10000 });
    await tasksPage.goto();
    await expect(page.getByText(taskName, { exact: true })).not.toBeVisible({ timeout: 5000 });
});

test("Фильтрация задач", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);
    const tasksPage = new TasksPage(page);

    await tasksPage.goto();
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({ timeout: 10000 });

    await tasksPage.filterByStatus("Draft");
    await expect(page.getByRole("heading", { name: "Draft" })).toBeVisible();
    const draftColumn = tasksPage.getColumn("Draft");
    await expect(draftColumn.getByRole("button").first()).toBeVisible({ timeout: 5000 });

    await tasksPage.filterByAssignee();
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
});

test("Перемещение задачи между колонками", async ({ page }) => {
    test.setTimeout(60000);

    await login(page);
    const tasksPage = new TasksPage(page);

    await tasksPage.goto();
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({ timeout: 10000 });

    const draftColumn = tasksPage.getColumn("Draft");
    const firstTask = draftColumn.getByRole("button").first();
    await expect(firstTask).toBeVisible({ timeout: 5000 });

    const fullText = await firstTask.textContent();
    const taskTitle = fullText?.split(/\s/).slice(0, 2).join(" ") || "";

    const toReviewColumn = tasksPage.getColumn("To Review");
    await firstTask.dragTo(toReviewColumn);

    await expect(toReviewColumn.getByText(taskTitle)).toBeVisible({ timeout: 5000 });
});
