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

test("Создание нового пользователя", async ({ page }) => {
    await page.goto("/");
    // 2) Логин
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("password");

    // Кнопка submit с текстом Sign in
    await page.getByRole("button", {name: /^sign in$/i}).click();

    // проверяем что реально вошли
    await expect(page.getByText("Welcome to the administration")).toBeVisible();

    // кликаем по кнопке меню
    await page.getByTestId("MenuIcon").click();
    await page.getByRole("menuitem", { name: "Users" }).click();
    await page.getByRole("link", { name: "Create" }).click();
    // создать нового пользователя
    const uniq = Date.now();
    const email = `tanya.test+${uniq}@example.com`;
    const firstName = "Tanya";
    const lastName = "Pod";

    await page.locator('input[name="email"]').fill("tanya.test@example.com");
    await page.locator('input[name="firstName"]').fill("Tanya");
    await page.locator('input[name="lastName"]').fill("Pod");
    //Сохранили пользователя
    await page.getByLabel("Save").click();


});

test("Просмотр списка пользователей", async ({ page }) => {
    // Переходим на главную страницу
    await page.goto("/");

    // Выполняем логин
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("password");
    await page.getByRole("button", {name: /^sign in$/i}).click();

    // Проверяем, что успешно вошли в систему
    await expect(page.getByText("Welcome to the administration")).toBeVisible();

    // Открываем меню и переходим к списку пользователей
    await page.getByTestId("MenuIcon").click();
    await page.getByRole("menuitem", { name: "Users" }).click();

    // Проверяем, что список пользователей отображается
    const usersList = page.locator('table, [role="table"], [data-testid*="user"], .users-list');
    await expect(usersList.first()).toBeVisible();

    // Получаем все строки с пользователями
    const userRows = page.locator('tbody tr, [role="row"]:not([role="columnheader"]), [data-testid*="user-row"]');

    // Проверяем, что список не пустой
    const userCount = await userRows.count();
    expect(userCount).toBeGreaterThan(0);

    // Проверяем каждого пользователя в списке
    for (let i = 0; i < userCount; i++) {
        const currentRow = userRows.nth(i);

        // Проверяем, что строка видима
        await expect(currentRow).toBeVisible();

        // Проверяем наличие email
        const emailElement = currentRow.locator('td:has-text("@"), [data-field="email"], input[name*="email"]');
        const emailVisible = await emailElement.first().isVisible({ timeout: 2000 }).catch(() => false);

        if (!emailVisible) {
            const emailText = currentRow.locator('text=/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/');
            await expect(emailText.first()).toBeVisible();
        } else {
            await expect(emailElement.first()).toBeVisible();
        }

        // Проверяем наличие имени
        const firstNameElement = currentRow.locator('[data-field="firstName"], input[name*="firstName"], td:nth-child(2)');
        await expect(firstNameElement.first()).toBeVisible({ timeout: 2000 });

        // Проверяем наличие фамилии
        const lastNameElement = currentRow.locator('[data-field="lastName"], input[name*="lastName"], td:nth-child(3)');
        await expect(lastNameElement.first()).toBeVisible({ timeout: 2000 });
    }
});

test("Редактирование информации о пользователе", async ({ page }) => {
    // Переходим на главную страницу
    await page.goto("/");

    // Выполняем логин
    await page.locator('input[name="username"]').fill("admin");
    await page.locator('input[name="password"]').fill("password");
    await page.getByRole("button", {name: /^sign in$/i}).click();

    // Проверяем, что успешно вошли в систему
    await expect(page.getByText("Welcome to the administration")).toBeVisible();

    // Открываем меню и переходим к списку пользователей
    await page.getByTestId("MenuIcon").click();
    await page.getByRole("menuitem", { name: "Users" }).click();

    // Проверяем, что список пользователей отображается
    const userRows = page.locator('tbody tr, [role="row"]:not([role="columnheader"]), [data-testid*="user-row"]');
    const userCount = await userRows.count();
    expect(userCount).toBeGreaterThan(0);

    // Выбираем первого пользователя для редактирования
    const firstUserRow = userRows.first();

    // Находим кнопку редактирования (может быть иконка редактирования, ссылка Edit, или клик по строке)
    const editButton = firstUserRow.locator('button[aria-label*="Edit"], a[href*="edit"], button:has-text("Edit"), [data-testid*="edit"]').first();

    // Если не нашли кнопку редактирования, пробуем другие варианты
    if (await editButton.count() === 0) {
        const editLink = page.locator('a:has-text("Edit"), [role="link"]:has-text("Edit")').first();
        if (await editLink.count() > 0) {
            await editLink.click();
        } else {
            // Кликаем по строке пользователя
            await firstUserRow.click();
        }
    } else {
        await editButton.click();
    }

    // Проверяем, что форма редактирования пользователя отображается правильно
    const emailField = page.locator('input[name="email"], input[type="email"]');
    const firstNameField = page.locator('input[name="firstName"]');
    const lastNameField = page.locator('input[name="lastName"]');

    // Проверяем, что все поля формы видимы
    await expect(emailField).toBeVisible();
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();

    // Сохраняем текущие значения полей
    const currentEmail = await emailField.inputValue();
    const currentFirstName = await firstNameField.inputValue();
    const currentLastName = await lastNameField.inputValue();

    // Генерируем уникальные данные для изменения
    const uniq = Date.now();
    const newEmail = `updated.user+${uniq}@example.com`;
    const newFirstName = "UpdatedFirstName";
    const newLastName = "UpdatedLastName";

    // Изменяем данные пользователя
    await emailField.clear();
    await emailField.fill(newEmail);

    await firstNameField.clear();
    await firstNameField.fill(newFirstName);

    await lastNameField.clear();
    await lastNameField.fill(newLastName);

    // Сохраняем изменения
    await page.getByLabel("Save").click();

    // Проверяем сообщение об успешном сохранении в снекбаре («Element updated»)
    await expect(page.getByText("Element updated")).toBeVisible({ timeout: 5000 });

    // Переходим обратно к списку пользователей, если нужно
    const isOnUsersPage = await page.getByRole("menuitem", { name: "Users" }).isVisible().catch(() => false);
    if (!isOnUsersPage) {
        await page.getByTestId("MenuIcon").click();
        await page.getByRole("menuitem", { name: "Users" }).click();
    }

    // Ищем обновленного пользователя в списке по новому email
    await expect(page.getByText(newEmail)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(newFirstName)).toBeVisible();
    await expect(page.getByText(newLastName)).toBeVisible();
});

/**
 * Тест: Валидация данных при редактировании пользователя
 * Проверяет валидацию полей формы, включая проверку корректности email
 */
test("валидация данных при редактировании пользователя", async ({ page }) => {
    await page.goto("/");

    await page.locator('input[name="username"]').fill(ADMIN.username);
    await page.locator('input[name="password"]').fill(ADMIN.password);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page.getByText("Welcome to the administration")).toBeVisible();

    await page.getByTestId("MenuIcon").locator("..").click();
    await page.getByRole("menuitem", { name: "Users" }).first().click();

    const table = page.locator("#main-content table.RaDatagrid-table");
    await expect(table).toBeVisible();

    const firstRow = table.locator("tbody tr").first();
    await firstRow.click();

    const emailInput = page.locator('input[name="email"]');
    const firstNameInput = page.locator('input[name="firstName"]');
    const lastNameInput = page.locator('input[name="lastName"]');
    const saveBtn = page.getByLabel("Save");

    await expect(emailInput).toBeVisible();
    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(saveBtn).toBeVisible();

    // невалидный email
    await emailInput.fill("not-an-email");
    await saveBtn.click();
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");

    // валидные данные
    const uniq = Date.now();
    const newEmail = `tanya.edit+${uniq}@example.com`;
    const newFirstName = `Tanya${uniq}`;
    const newLastName = `Pod${uniq}`;

    await emailInput.fill(newEmail);
    await firstNameInput.fill(newFirstName);
    await lastNameInput.fill(newLastName);

    await saveBtn.click();
    await expect(page.getByText("Element updated")).toBeVisible({ timeout: 10000 });

    // проверка в списке
    await page.goto("/#/users");
    await expect(page.locator("#main-content table.RaDatagrid-table")).toBeVisible();
    await expect(page.locator("#main-content table.RaDatagrid-table")).toContainText(newEmail);
});



test("Удаление созданного пользователя: создать -> удалить -> убедиться что исчез", async ({ page }) => {
    await login(page);

    // Открываем Users
    await page.getByTestId("MenuIcon").locator("..").click();
    await page.getByRole("menuitem", { name: "Users" }).first().click();

    // Create
    await page.getByRole("link", { name: "Create" }).click();

    // создаём нового пользователя
    const uniq = Date.now();
    const email = `qwertty.test+${uniq}@example.com`;
    const firstName = "Qwerty";
    const lastName = "Qwert";

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="firstName"]').fill(firstName);
    await page.locator('input[name="lastName"]').fill(lastName);

    await page.getByLabel("Save").click();

    // Возвращаемся в список Users
    await page.goto("/#/users");
    const table = page.locator("#main-content table.RaDatagrid-table");
    await expect(table).toBeVisible();

    // Находим строку с нашим email
    const userRow = table.locator("tbody tr", { hasText: email }); //
    await expect(userRow).toBeVisible({ timeout: 10000 });

    // Выбираем чекбокс именно в этой строке
    await userRow.locator('input[type="checkbox"]').click();

    // Нажимаем Delete
    await page.getByLabel("Delete").click();

    // Ждём подтверждение удаления (toast)
    await expect(page.getByText(/deleted|success|removed/i)).toBeVisible({ timeout: 10000 });

    // Проверяем, что пользователя больше нет
    await expect(table.locator("tbody tr", { hasText: email })).toHaveCount(0); //
});

test("Массовое удаление всех пользователей", async ({ page }) => {
    await login(page);

    // Переходим к списку пользователей
    await page.getByTestId("MenuIcon").locator("..").click();
    await page.getByRole("menuitem", { name: "Users" }).first().click();

    await page.goto("/#/users");
    const table = page.locator("#main-content table.RaDatagrid-table");
    await expect(table).toBeVisible();

    // Считаем количество строк с пользователями (без строки заголовка)
    const rows = table.locator("tbody tr");
    const countBefore = await rows.count();

    // Если пользователей нет — нечего удалять
    if (countBefore === 0) {
        return;
    }

    // Выбираем всех: чекбокс «выбрать все» в заголовке таблицы
    const selectAllCheckbox = page.getByRole("checkbox", { name: "Select all" });
    await selectAllCheckbox.click();

    // Нажимаем Delete
    await page.getByLabel("Delete").click();

    // Подтверждение (если есть диалог)
    const confirmButton = page.getByRole("button", { name: /confirm|удалить|да|yes/i });
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
    }

    // Ждём сообщение об успешном удалении
    await expect(page.getByText(/deleted|success|removed/i)).toBeVisible({ timeout: 10000 });

    // Проверяем пустое состояние: отображается «No Users yet.»
    await expect(page.getByText("No Users yet.")).toBeVisible({ timeout: 10000 });
});