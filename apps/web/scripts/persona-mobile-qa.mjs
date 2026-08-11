import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const artifacts = path.resolve("../../artifacts/spatial-ui");
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "CUSTOMIZE AI FORM" }).click();
  await page.getByRole("button", { name: /Totem/ }).click();
  await page.screenshot({ path: path.join(artifacts, "persona-studio-mobile.png"), fullPage: true });
  const viewport = await page.locator(".persona-studio").evaluate((node) => ({ width: node.clientWidth, scrollWidth: node.scrollWidth, height: node.clientHeight }));
  if (viewport.scrollWidth > viewport.width || errors.length) throw new Error(JSON.stringify({ viewport, errors }));
  await page.getByRole("button", { name: "KEEP THIS FORM" }).click();
  await page.getByRole("dialog", { name: "Customize AI form" }).waitFor({ state: "hidden" });
  await page.screenshot({ path: path.join(artifacts, "self-space-mobile-optimized.png") });
  console.log(JSON.stringify({ mobile_persona_ui: "PASS", viewport, console_errors: 0 }, null, 2));
} finally {
  await browser.close();
}
