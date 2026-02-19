import fs from "fs";
import path from "path";

export default async function globalSetup() {
    if (!process.env.COVERAGE) return;
    const rawDir = path.join(process.cwd(), "coverage", "raw");
    if (!fs.existsSync(rawDir)) {
        fs.mkdirSync(rawDir, { recursive: true });
    }
    fs.writeFileSync(path.join(rawDir, "out.json"), "[]", "utf8");
}
