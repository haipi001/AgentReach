import { chromium } from "playwright-core";

const WEB = process.env.AGENTREACH_E2E_WEB ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };

try {
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.locator(".core-universe").waitFor({ timeout: 20_000 });
  check((await page.locator(".surface-location").textContent())?.includes("自我宇宙"), "initial surface is not self");

  await page.locator('.dimension-node').filter({ hasText: "关系" }).click();
  await page.locator(".dimension-detail").waitFor();
  check((await page.locator(".surface-location").textContent())?.includes("核心维度·关系"), "dimension route not reflected");
  await page.locator(".dimension-detail > header button").click();

  await page.getByRole("button", { name: /02 \/ 任务空间/ }).click();
  await page.waitForFunction(() => window.scrollY > window.innerHeight * .72);
  check((await page.locator(".surface-location").textContent())?.includes("行动工作面"), "workspace route not reflected");
  check(Math.abs(await page.locator("#task-workspace").evaluate(node => node.getBoundingClientRect().top)) < 50, "workspace did not align to viewport");

  await page.locator(".nav-menu").click();
  await page.locator(".system-panel").waitFor();
  check((await page.locator(".surface-location").textContent())?.includes("系统控制面"), "system route not reflected");
  await page.locator(".system-panel > header > button").click();
  await page.locator(".system-panel").waitFor({ state: "hidden" });
  check((await page.locator(".surface-location").textContent())?.includes("行动工作面"), "system close did not restore workspace route");

  await page.screenshot({ path: "../../artifacts/spatial-ui/surface-navigation-desktop.png", fullPage: false });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(WEB, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await mobile.locator(".core-universe").waitFor({ timeout: 20_000 });
  check(await mobile.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, "mobile horizontal overflow");
  await mobile.screenshot({ path: "../../artifacts/spatial-ui/surface-navigation-mobile.png", fullPage: false });
  await mobile.close();

  if (failures.length) throw new Error(failures.join("; "));
  console.log(JSON.stringify({ navigation: "PASS", checks: 8, desktop: "1440x1000", mobile: "390x844" }, null, 2));
} finally {
  await browser.close();
}
