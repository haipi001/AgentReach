import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const artifacts = path.resolve("../../artifacts/spatial-ui");
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 734, height: 936 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.addInitScript(() => localStorage.setItem("agentreach-persona", JSON.stringify({ state: { persona: { name: "HAIPI", form: "human", finish: "matte", accent: "lichen", aura: 0.52 } }, version: 2 })));
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(artifacts, "human-avatar-734x936.png") });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(JSON.stringify({ human_avatar: "PASS", viewport: "734x936", console_errors: 0 }, null, 2));
} finally {
  await browser.close();
}
