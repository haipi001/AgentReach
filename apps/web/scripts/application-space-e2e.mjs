import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

const WEB = process.env.AGENTREACH_E2E_WEB ?? "http://127.0.0.1:3000";
const API = process.env.AGENTREACH_E2E_API ?? "http://127.0.0.1:8765";
const artifact = (name) => fileURLToPath(new URL(`../../../artifacts/spatial-ui/${name}`, import.meta.url));
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

try {
  const authority = await fetch(`${API}/api/local-world/applications`).then((response) => response.json());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => document.querySelectorAll(".dimension-node").length === 7, null, { timeout: 30_000 });
  await page.locator(".dimension-node", { hasText: "本地" }).click();
  await page.locator(".local-world-space").waitFor({ timeout: 25_000 });
  await page.locator(".local-world-node.node-applications").click();
  await page.locator(".application-space").waitFor({ timeout: 20_000 });
  const cards = await page.locator(".application-grid button").count();
  const installed = await page.locator(".application-grid button.installed").count();
  const runtimeErrors = await page.locator(".surface-runtime-error").count();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (cards !== authority.total || installed !== authority.installed || runtimeErrors || overflow > 1) throw new Error(JSON.stringify({ cards, installed, authority, runtimeErrors, overflow }));
  await page.screenshot({ path: artifact("application-space-desktop.png"), fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  if (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) > 1) throw new Error("application space overflows mobile viewport");
  await page.screenshot({ path: artifact("application-space-mobile.png"), fullPage: false });
  process.stdout.write(`${JSON.stringify({ applications: "PASS", cards, installed, desktopOverflow: overflow, mobileOverflow: 0 })}\n`);
} finally {
  await browser.close();
}
