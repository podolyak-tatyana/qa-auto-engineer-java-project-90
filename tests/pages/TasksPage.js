/** Страница задач (канбан) */
export class TasksPage {
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto("/#/tasks");
    }

    async create(title, content, assignee = "emily@example.com", status = "To Publish") {
        await this.page.getByRole("link", { name: /create/i }).click();
        await this.page.locator('input[name="title"]').fill(title);
        await this.page.locator('textarea[name="content"]').fill(content);

        await this.page.getByRole("combobox").first().click();
        await this.page.getByRole("option", { name: assignee }).click();

        await this.page.getByRole("combobox").nth(1).click();
        await this.page.getByRole("option", { name: status }).click();

        const labelCount = await this.page.getByRole("combobox").count();
        if (labelCount >= 3) {
            await this.page.getByRole("combobox").nth(2).click();
            await this.page.getByRole("option").first().click();
            await this.page.keyboard.press("Escape");
        }

        await this.page.getByLabel("Save").click();
    }

    async openEditByTaskName(taskName) {
        const card = this.page.getByRole("button").filter({ hasText: taskName });
        await card.getByRole("link", { name: "Edit" }).click();
    }

    async filterByStatus(status) {
        await this.page.getByRole("combobox", { name: "Status" }).click();
        await this.page.getByRole("option", { name: status }).click();
    }

    async filterByAssignee() {
        await this.page.getByRole("combobox", { name: "Assignee" }).click();
        await this.page.getByRole("option", { name: /@/ }).first().click();
    }

    getColumn(name) {
        return this.page.getByRole("heading", { name }).locator("../..");
    }
}
