import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

const WEB = process.env.AGENTREACH_E2E_WEB ?? "http://127.0.0.1:3000";
const API = process.env.AGENTREACH_E2E_API ?? "http://127.0.0.1:8765";
const artifact = (name) => fileURLToPath(new URL(`../../../artifacts/spatial-ui/${name}`, import.meta.url));
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

try {
  const authority = await fetch(`${API}/api/local-world/compute`).then((response) => response.json());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.locator(".dimension-node", { hasText: "本地" }).click();
  await page.locator(".local-world-node.node-compute").click();
  await page.locator(".compute-space").waitFor({ timeout: 20_000 });
  const providers = await page.locator(".compute-providers article").count();
  const meters = await page.locator(".compute-meter").count();
  const route = (await page.locator(".compute-route strong").textContent())?.trim();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (providers !== authority.providers.length || meters !== 3 || !route || overflow > 1) throw new Error(JSON.stringify({ providers, meters, route, overflow }));
  await page.screenshot({ path: artifact("compute-space-desktop.png"), fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (mobileOverflow > 1) throw new Error(`mobile overflow ${mobileOverflow}`);
  await page.screenshot({ path: artifact("compute-space-mobile.png"), fullPage: false });
  process.stdout.write(`${JSON.stringify({ compute: "PASS", providers, meters, route, desktopOverflow: overflow, mobileOverflow })}\n`);
} finally { await browser.close(); }
