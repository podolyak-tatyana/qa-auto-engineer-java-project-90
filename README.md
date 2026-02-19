[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=podolyak-tatyana_qa-auto-engineer-java-project-90&metric=coverage)](https://sonarcloud.io/summary/new_code?id=podolyak-tatyana_qa-auto-engineer-java-project-90)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=podolyak-tatyana_qa-auto-engineer-java-project-90&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=podolyak-tatyana_qa-auto-engineer-java-project-90)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=podolyak-tatyana_qa-auto-engineer-java-project-90&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=podolyak-tatyana_qa-auto-engineer-java-project-90)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=podolyak-tatyana_qa-auto-engineer-java-project-90&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=podolyak-tatyana_qa-auto-engineer-java-project-90)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=podolyak-tatyana_qa-auto-engineer-java-project-90&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=podolyak-tatyana_qa-auto-engineer-java-project-90)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=podolyak-tatyana_qa-auto-engineer-java-project-90&metric=bugs)](https://sonarcloud.io/summary/new_code?id=podolyak-tatyana_qa-auto-engineer-java-project-90)
# UI-автотесты Task Manager

Автотесты на **Playwright** для веб-приложения канбан-доски и админ-панели (React Admin).

## Требования

- Node.js
- npm

## Установка

```bash
npm install
npx playwright install
```

## Запуск тестов

```bash
npx playwright test
```

Приложение автоматически запускается на `http://localhost:5173`.

### Примеры запуска конкретных тестов

Запуск одной группы тестов (по папке):

```bash
npx playwright test tests/auth
npx playwright test tests/users
npx playwright test tests/labels
npx playwright test tests/statuses
npx playwright test tests/tasks
```

Запуск одного файла:

```bash
npx playwright test tests/users/create-user.spec.js
npx playwright test tests/auth.spec.js
```

Запуск теста по названию (частичное совпадение):

```bash
npx playwright test -g "Создание нового пользователя"
npx playwright test -g "login and logout"
npx playwright test -g "канбан"
```

Запуск в UI-режиме (интерактивно):

```bash
npx playwright test --ui
```

Запуск с видимым браузером (если в конфиге включён headless):

```bash
npx playwright test --headed
```

## CI/CD

Ветки и теги проверяются пайплайном **hexlet-check** (GitHub Actions):

- **Триггер:** каждый push в любую ветку и каждый тег.
- **Шаги:** сборка в Docker, установка зависимостей, запуск Playwright-тестов и ESLint.
- **Окружение:** образ с Playwright (Ubuntu), приложение поднимается внутри контейнера.

Файл workflow: [.github/workflows/hexlet-check.yml](.github/workflows/hexlet-check.yml).

## Структура проекта

```
.
├── .github/
│   └── workflows/
│       └── hexlet-check.yml    # CI: тесты и линтер при push
├── src/                        # Исходный код приложения (Vite + React)
├── tests/                      # Автотесты Playwright
│   ├── auth.spec.js            # Вход и выход из системы
│   ├── helpers/
│   │   └── auth.js             # Хелпер login(), учётные данные
│   ├── pages/                  # Page Object — работа со страницами
│   │   ├── UsersPage.js
│   │   ├── LabelsPage.js
│   │   ├── StatusesPage.js
│   │   └── TasksPage.js
│   ├── users/
│   │   └── create-user.spec.js # Тесты пользователей
│   ├── labels/
│   │   └── labels.spec.js      # Тесты меток
│   ├── statuses/
│   │   └── statuses.spec.js    # Тесты статусов задач
│   └── tasks/
│       └── tasks.spec.js      # Тесты задач и канбана
├── playwright.config.js        # Конфиг Playwright (baseURL, webServer)
├── package.json
└── README.md
```

- **Спеки** (`*.spec.js`) — сценарии тестов, используют хелперы и Page Object.
- **helpers/** — общая логика (например, авторизация).
- **pages/** — классы для страниц: навигация, формы, таблицы, действия (создать, удалить и т.д.).

## Покрытие тестами

- **Авторизация** — вход, выход
- **Пользователи** — создание, просмотр, редактирование, валидация, удаление, массовое удаление
- **Метки** — создание, просмотр, редактирование, удаление, массовое удаление
- **Статусы** — создание, просмотр, редактирование, удаление, массовое удаление
- **Задачи** — создание, редактирование, канбан-доска, удаление, фильтрация, перемещение между колонками

## Учётные данные

- **Логин:** admin  
- **Пароль:** password
