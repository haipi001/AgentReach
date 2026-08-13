import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator(".core-universe").waitFor({ timeout: 60000 });
  await page.locator(".agent-core").first().waitFor({ state: "attached" });

  const shell = await page.evaluate(() => ({
    dimensions: document.querySelectorAll(".dimension-node").length,
    cores: document.querySelectorAll(".agent-core").length,
    hasTask: Boolean(document.querySelector("#task-workspace")),
    hasCalibration: [...document.querySelectorAll("button")].some((button) => button.textContent?.includes("核心校准")),
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
    horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  if (shell.dimensions !== 6 || shell.cores < 2 || !shell.hasTask || !shell.hasCalibration) throw new Error(`产品结构不完整：${JSON.stringify(shell)}`);

  await page.getByRole("button", { name: /关系/ }).click();
  await page.getByRole("heading", { name: "你与 HAIPI" }).waitFor();
  await page.getByLabel("关闭维度详情").click();
  await page.getByRole("button", { name: /维度设置/ }).click();
  await page.getByText("自定义维度", { exact: true }).waitFor();
  if (shell.scrollHeight < shell.viewportHeight * 1.8) throw new Error("双屏产品流程高度不足");
  if (shell.horizontalOverflow > 1) throw new Error(`页面横向溢出 ${shell.horizontalOverflow}px`);

  await page.getByRole("button", { name: "打开系统控制面" }).click();
  await page.getByRole("complementary", { name: "AgentReach 系统控制面" }).waitFor();
  await page.getByRole("button", { name: "OWNER", exact: true }).click();
  await page.getByText("PORTABLE OWNER DATA", { exact: true }).waitFor();
  await page.getByRole("button", { name: "导出 Owner 备份" }).waitFor();
  await page.getByText("选择备份文件", { exact: true }).waitFor();
  await page.getByRole("complementary", { name: "AgentReach 系统控制面" }).getByRole("button", { name: "关闭系统控制面" }).click();

  await page.locator("#task-workspace").evaluate((node) => window.scrollTo({ top: node.offsetTop, behavior: "auto" }));
  await page.waitForTimeout(200);
  const taskTop = await page.locator("#task-workspace").evaluate((node) => node.getBoundingClientRect().top);
  if (Math.abs(taskTop) > 40) throw new Error(`任务空间未对齐视口：${taskTop}`);
  if (errors.length) throw new Error(`页面运行错误：\n${errors.join("\n")}`);

  console.log(JSON.stringify({ ui: "PASS", ...shell, taskTop, runtimeErrors: 0 }, null, 2));
} finally {
  await browser.close();
}
