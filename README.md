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

Приложение автоматически запускается на `http://localhost:5173`


## Покрытие тестами

- **Авторизация** — вход, выход
- **Пользователи** — создание, просмотр, редактирование, валидация, удаление, массовое удаление
- **Метки** — создание, просмотр, редактирование, удаление, массовое удаление
- **Статусы** — создание, просмотр, редактирование, удаление, массовое удаление
- **Задачи** — создание, редактирование, канбан-доска, удаление, фильтрация, перемещение между колонками

## Учётные данные

- **Логин:** admin  
- **Пароль:** password
