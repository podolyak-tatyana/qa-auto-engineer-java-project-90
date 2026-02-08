import {expect} from "@playwright/test";

/** Страница лейблов */
export class LabelsPage {
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto("/#/labels");
    }

    async create(name) {
        await this.page.getByRole("link", { name: /create/i }).click();
        await this.page.locator('input[name="name"]').fill(name);
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
