import fs from "fs";
import path from "path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const COVERAGE_DIR = path.join(process.cwd(), "coverage");
const RAW_DIR = path.join(COVERAGE_DIR, "raw");
const OUT_FILE = path.join(RAW_DIR, "out.json");

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Сохранить сырые данные покрытия (вызывать из фикстуры после теста).
 * При COVERAGE=1 и workers=1 записываем в один файл.
 */
export function saveCoverage(coverageObject) {
    if (!coverageObject || typeof coverageObject !== "object") return;
    ensureDir(RAW_DIR);
    let list = [];
    if (fs.existsSync(OUT_FILE)) {
        try {
            list = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
        } catch (_) {}
        if (!Array.isArray(list)) list = [];
    }
    list.push(coverageObject);
    fs.writeFileSync(OUT_FILE, JSON.stringify(list), "utf8");
}

/**
 * globalTeardown: объединить покрытие и записать coverage/lcov.info
 */
export async function coverageGlobalTeardown() {
    if (!process.env.COVERAGE) return;
    ensureDir(COVERAGE_DIR);
    if (!fs.existsSync(OUT_FILE)) return;
    let list;
    try {
        list = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
    } catch (_) {
        return;
    }
    if (!Array.isArray(list) || list.length === 0) return;

    const libCoverage = require("istanbul-lib-coverage");
    const libReport = require("istanbul-lib-report");
    const reports = require("istanbul-reports");

    const map = libCoverage.createCoverageMap({});
    for (const cov of list) {
        if (cov && typeof cov === "object") {
            for (const fileCov of Object.values(cov)) {
                if (fileCov && typeof fileCov === "object") {
                    try {
                        map.addFileCoverage(fileCov);
                    } catch (_) {}
                }
            }
        }
    }

    const context = libReport.createContext({ coverageMap: map, dir: COVERAGE_DIR });
    reports.create("lcovonly", { file: "lcov.info" }).execute(context);
    reports.create("html", { subdir: ".", verbose: false }).execute(context);
}
