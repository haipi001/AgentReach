import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

const WEB = process.env.AGENTREACH_E2E_WEB ?? "http://127.0.0.1:3000";
const artifact = (name) => fileURLToPath(new URL(`../../../artifacts/spatial-ui/${name}`, import.meta.url));
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => document.querySelectorAll(".dimension-node").length === 7, null, { timeout: 30_000 });
  await page.waitForFunction(() => document.querySelectorAll(".self-intent-glance button").length > 0 && document.querySelectorAll(".self-growth circle").length > 0, null, { timeout: 20_000 });
  const intents = await page.locator(".self-intent-glance button").count();
  const activities = await page.locator(".self-recent p:not(.empty)").count();
  const growthPoints = await page.locator(".self-growth circle").count();
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (intents < 1 || intents > 3 || activities < 1 || activities > 3 || growthPoints < 1 || growthPoints > 8 || desktopOverflow > 1) throw new Error(JSON.stringify({ intents, activities, growthPoints, desktopOverflow }));
  await page.screenshot({ path: artifact("self-overview-desktop.png"), fullPage: false });
  await page.locator(".self-intent-glance button").first().click();
  await page.waitForFunction(() => scrollY > innerHeight * .7, null, { timeout: 10_000 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "auto" }));
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileVisible = await page.locator(".self-mobile-glance").isVisible();
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (!mobileVisible || mobileOverflow > 1) throw new Error(JSON.stringify({ mobileVisible, mobileOverflow }));
  process.stdout.write(`${JSON.stringify({ selfOverview: "PASS", intents, activities, growthPoints, desktopOverflow, mobileOverflow })}\n`);
} finally { await browser.close(); }
