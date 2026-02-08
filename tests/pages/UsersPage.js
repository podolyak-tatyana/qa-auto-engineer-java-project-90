/** Страница пользователей */
export class UsersPage {
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto("/#/users");
    }

    async openCreate() {
        await this.page.getByRole("link", { name: "Create" }).click();
    }

    async createUser(email, firstName, lastName) {
        await this.openCreate();
        await this.page.locator('input[name="email"]').fill(email);
        await this.page.locator('input[name="firstName"]').fill(firstName);
        await this.page.locator('input[name="lastName"]').fill(lastName);
        await this.page.getByLabel("Save").click();
    }

    getTable() {
        return this.page.locator("#main-content table.RaDatagrid-table");
    }

    async selectRowByText(text) {
        const row = this.getTable().locator("tbody tr", { hasText: text });
        await row.locator('input[type="checkbox"]').click();
    }

    async selectAll() {
        await this.page.getByRole("checkbox", { name: "Select all" }).click();
    }

    async delete() {
        await this.page.getByLabel("Delete").click();
    }

    async confirmDialog() {
        const btn = this.page.getByRole("button", { name: /confirm|удалить|да|yes/i });
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await btn.click();
        }
    }
}
