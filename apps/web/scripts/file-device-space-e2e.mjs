import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";

const WEB = process.env.AGENTREACH_E2E_WEB ?? "http://127.0.0.1:3000";
const API = process.env.AGENTREACH_E2E_API ?? "http://127.0.0.1:8765";
const artifact = (name) => fileURLToPath(new URL(`../../../artifacts/spatial-ui/${name}`, import.meta.url));
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

try {
  const authority = await fetch(`${API}/api/local-world/files-devices`).then((response) => response.json());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => document.querySelectorAll(".dimension-node").length === 7, null, { timeout: 30_000 });
  await page.waitForTimeout(500);
  await page.locator(".dimension-node", { hasText: "本地" }).click();
  await page.locator(".local-world-node.node-files").click();
  await page.locator(".file-device-space").waitFor({ timeout: 25_000 });
  const scopes = await page.locator(".fd-scope-map article").count();
  const files = await page.locator(".fd-recent article").count();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (scopes !== authority.scopes.length || files !== authority.recent_files.length || overflow > 1) throw new Error(JSON.stringify({ scopes, files, overflow }));
  await page.screenshot({ path: artifact("file-device-space-desktop.png"), fullPage: false });
  await page.getByRole("button", { name: /^设备/ }).click();
  const devices = await page.locator(".fd-devices article").count();
  if (devices !== authority.devices.length) throw new Error(`device mismatch ${devices}/${authority.devices.length}`);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (mobileOverflow > 1) throw new Error(`mobile overflow ${mobileOverflow}`);
  await page.screenshot({ path: artifact("file-device-space-mobile.png"), fullPage: false });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByLabel("关闭维度详情").click();
  await page.locator("#task-workspace").scrollIntoViewIfNeeded();
  const evidenceLink = page.locator(".world-evidence-link").first();
  await evidenceLink.waitFor({ timeout: 20_000 });
  await evidenceLink.click();
  await page.locator(".fd-artifacts").waitFor({ timeout: 20_000 });
  await page.waitForTimeout(750);
  const linkedArtifacts = await page.locator(".fd-artifacts article").count();
  const linkedTop = await page.evaluate(() => scrollY);
  if (linkedArtifacts !== authority.evidence_artifacts.length || linkedTop > 8) throw new Error(JSON.stringify({ linkedArtifacts, expected: authority.evidence_artifacts.length, linkedTop }));
  await page.screenshot({ path: artifact("file-device-evidence-link.png"), fullPage: false });
  process.stdout.write(`${JSON.stringify({ filesDevices: "PASS", scopes, files, devices, linkedArtifacts, linkedTop, desktopOverflow: overflow, mobileOverflow })}\n`);
} finally { await browser.close(); }
