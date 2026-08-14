import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

const WEB = process.env.AGENTREACH_E2E_WEB ?? "http://127.0.0.1:3000";
const artifact = (name) => fileURLToPath(new URL(`../../../artifacts/spatial-ui/${name}`, import.meta.url));
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => document.querySelectorAll(".dimension-node").length === 7, null, { timeout: 30_000 });
  await page.waitForTimeout(500);
  await page.locator(".dimension-node", { hasText: "本地" }).click();
  await page.locator(".local-world-space").waitFor({ timeout: 25_000 });
  const nodes = await page.locator(".local-world-node").count();
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (nodes !== 4 || desktopOverflow > 1) throw new Error(JSON.stringify({ nodes, desktopOverflow }));
  await page.screenshot({ path: artifact("local-world-desktop.png"), fullPage: false });
  await page.locator(".local-world-node.node-applications").click();
  await page.locator(".application-space").waitFor({ timeout: 20_000 });
  await page.getByRole("button", { name: "← 本地世界" }).click();
  await page.locator(".local-world-space").waitFor({ timeout: 20_000 });
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (mobileOverflow > 1) throw new Error(`mobile overflow ${mobileOverflow}`);
  process.stdout.write(`${JSON.stringify({ localWorld: "PASS", primaryDimensions: 7, nodes, desktopOverflow, mobileOverflow })}\n`);
} finally { await browser.close(); }
