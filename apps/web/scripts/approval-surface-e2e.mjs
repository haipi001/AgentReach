import { chromium } from "playwright-core";

const API = process.env.AGENTREACH_E2E_API ?? "http://127.0.0.1:8765";
const WEB = process.env.AGENTREACH_E2E_WEB ?? "http://127.0.0.1:3000";
const post = (path, body) => fetch(`${API}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) }).then(async response => {
  if (!response.ok) throw new Error(`${path}: ${response.status} ${await response.text()}`);
  return response.json();
});
const checkpoint = (label, detail = "") => process.stdout.write(`[approval-e2e] ${label}${detail ? `: ${detail}` : ""}\n`);
const stage = () => fetch(`${API}/api/demo`).then(response => response.json());
const processUntil = async expected => {
  let state = await stage();
  for (let index = 0; index < 12 && state.stage !== expected; index += 1) state = await post("/api/runtime/jobs/process-next");
  if (state.stage !== expected) throw new Error(`expected ${expected}, received ${state.stage}`);
  return state;
};

checkpoint("reset");
await post("/api/demo/reset");
let state = await post("/api/runtime/start", { request: "寻找适合共同开发个人智能体的协作者" });
if (!state.candidates?.length) state = await processUntil("CANDIDATES_FOUND");
await post("/api/demo/select", { candidate_id: state.candidates[0].id });
checkpoint("fixture", "WAITING_USER_APPROVAL");

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
checkpoint("browser-launched");
const errors = [];
const inspect = async (name, buttonPattern, expectedStage, endpoint, expectedAfter) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  checkpoint("page-created", name);
  page.on("pageerror", error => errors.push(error.message));
  page.on("requestfailed", request => errors.push(`${request.url()} ${request.failure()?.errorText}`));
  await page.goto(WEB, { waitUntil: "domcontentloaded", timeout: 60000 });
  const surface = page.locator('[data-surface-id="workspace.approval"]');
  await surface.waitFor({ timeout: 20000 });
  await surface.scrollIntoViewIfNeeded();
  const snapshot = await surface.evaluate(node => ({ version: node.getAttribute("data-surface-version"), title: node.querySelector("h2")?.textContent, text: node.textContent?.replace(/\s+/g, " ").trim() }));
  await page.screenshot({ path: `../../artifacts/spatial-ui/schema-approval-${name}.png`, fullPage: true });
  await Promise.all([
    page.waitForResponse(response => response.url().endsWith(endpoint) && response.request().method() === "POST" && response.ok(), { timeout: 30_000 }),
    surface.getByRole("button", { name: buttonPattern }).click(),
  ]);
  await page.waitForFunction(async ({ api, expected }) => (await fetch(`${api}/api/demo`).then(response => response.json())).stage === expected, { api: API, expected: expectedAfter }, { timeout: 20_000 });
  const next = await stage();
  checkpoint(name, `${expectedStage} → ${next.stage}`);
  const metrics = { surfaceErrors: await page.locator(".surface-runtime-error").count(), horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) };
  await page.close();
  return { name, before: expectedStage, after: next.stage, snapshot, ...metrics };
};

try {
  const audit = [];
  audit.push(await inspect("introduction", /批准并触达/, "WAITING_USER_APPROVAL", "/api/demo/approve-introduction", "WAITING_PEER_APPROVAL"));
  await processUntil("WAITING_PEER_APPROVAL");
  audit.push(await inspect("peer", /代表 Alice 接受/, "WAITING_PEER_APPROVAL", "/api/demo/peer-decision", "COMMITMENT_PROPOSED"));
  await processUntil("COMMITMENT_PROPOSED");
  audit.push(await inspect("commitment", /执行并验证/, "COMMITMENT_PROPOSED", "/api/demo/approve-commitment", "COMPLETED"));
  await processUntil("COMPLETED");
  state = await stage();
  const result = { ui: "PASS", gates: audit, finalStage: state.stage, verdict: state.verification?.verdict, worldChanged: state.world_changed, evidence: state.evidence?.length, runtimeErrors: errors.length };
  if (errors.length || audit.some(item => item.surfaceErrors || item.horizontalOverflow > 1) || result.finalStage !== "COMPLETED" || result.verdict !== "VERIFIED" || !result.worldChanged) throw new Error(JSON.stringify(result));
  console.log(JSON.stringify(result, null, 2));
} catch (error) { console.error("[approval-e2e] FAIL", error); process.exitCode = 1; }
finally { await browser.close(); checkpoint("closed"); }
