import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

const WEB = process.env.AGENTREACH_E2E_WEB ?? "http://127.0.0.1:3000";
const API = process.env.AGENTREACH_E2E_API ?? "http://127.0.0.1:8765";
const artifact = (name) => fileURLToPath(new URL(`../../../artifacts/spatial-ui/${name}`, import.meta.url));
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

try {
  const authority = await fetch(`${API}/api/local-world/routines`).then((response) => response.json());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.locator(".dimension-node", { hasText: "本地" }).click();
  await page.locator(".local-world-node.node-routines").click();
  await page.locator(".dimension-detail").waitFor({ timeout: 20_000 });
  await page.locator(".routine-space").waitFor({ timeout: 20_000 });
  const steps = await page.locator(".routine-steps article").count();
  const observations = Number(await page.locator(".routine-metrics article").first().locator("strong").textContent());
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const autoDisabled = await page.getByRole("button", { name: /自动执行/ }).isDisabled();
  if (steps !== authority.routines[0].semantic_steps.length || observations !== authority.routines[0].observations || !autoDisabled || overflow > 1) throw new Error(JSON.stringify({ steps, observations, autoDisabled, overflow }));
  await page.getByRole("button", { name: /^继续学习/ }).click();
  await page.waitForFunction(() => document.querySelector('.routine-policy button.active')?.textContent?.includes('继续学习'));
  await page.screenshot({ path: artifact("routine-learning-desktop.png"), fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (mobileOverflow > 1) throw new Error(`mobile overflow ${mobileOverflow}`);
  await page.screenshot({ path: artifact("routine-learning-mobile.png"), fullPage: false });
  process.stdout.write(`${JSON.stringify({ routine: "PASS", steps, observations, autoDisabled, desktopOverflow: overflow, mobileOverflow })}\n`);
} finally { await browser.close(); }
