import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const artifacts = path.resolve("../../artifacts/spatial-ui");
await mkdir(artifacts, { recursive: true });

const browser = await chromium.launch({
  executablePath: chrome,
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
let page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => consoleErrors.push(error.message));

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Not a profile/ }).waitFor();
  await page.locator("canvas").waitFor();
  await page.screenshot({ path: path.join(artifacts, "01-self-space.png") });

  await page.getByRole("button", { name: "CUSTOMIZE FORM" }).click();
  await page.getByRole("dialog", { name: "Customize AI form" }).waitFor();
  await page.getByRole("button", { name: /Orbital/ }).click();
  await page.getByRole("button", { name: "chrome" }).click();
  await page.getByRole("button", { name: "cobalt" }).click();
  await page.getByRole("slider", { name: "Aura intensity" }).fill("0.8");
  await page.screenshot({ path: path.join(artifacts, "01b-persona-studio.png") });
  await page.getByRole("button", { name: "KEEP THIS FORM" }).click();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "CUSTOMIZE FORM" }).click();
  await page.getByRole("button", { name: "Orbital" }).waitFor();
  if (!await page.getByRole("button", { name: /Orbital/ }).evaluate((node) => node.classList.contains("selected"))) {
    throw new Error("Persona customization did not persist after reload");
  }
  await page.getByLabel("Close persona studio").click();

  // Start the protocol journey in a fresh WebGL page after the persistence check.
  await page.close();
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "MEMORY" }).click();
  await page.getByRole("heading", { name: "MEMORY" }).waitFor();
  await page.getByText("348", { exact: true }).waitFor();
  await page.screenshot({ path: path.join(artifacts, "02-memory-orbit.png") });
  await page.getByRole("button", { name: "Close panel" }).click();

  await page.locator(".composer").getByRole("button", { name: /REACH/ }).click();
  await page.locator(".reach-layer").waitFor();
  await page.getByRole("button", { name: /Alice/ }).waitFor();
  await page.getByRole("button", { name: /Bob/ }).waitFor();
  await page.getByRole("button", { name: /Carol/ }).waitFor();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(artifacts, "03-reach-space.png") });

  await page.getByRole("button", { name: /Alice/ }).click();
  await page.getByText("STAYS PRIVATE").waitFor();
  await page.getByText("私人关系备注").waitFor();
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(artifacts, "04-context-capsule.png") });

  await page.getByRole("button", { name: /APPROVE \+ REACH/ }).click();
  await page.getByText("ALICE AGENT / INBOX").waitFor();
  await page.getByRole("button", { name: "ALICE ACCEPTS" }).click();
  await page.getByText("WORLD ACTION GATE / L3 STRONG CONFIRM").waitFor();
  await page.getByRole("button", { name: /ACT \+ VERIFY/ }).click();
  await page.getByText("WORLD CHANGED / VERIFIED").waitFor();
  await page.getByText("Intent became evidence.").waitFor();
  await page.locator(".world-proof").getByText("Repository updated", { exact: false }).waitFor();
  await page.locator(".world-proof").getByText("Introduction sent", { exact: false }).waitFor();
  await page.locator(".world-proof").getByText("Memory updated", { exact: false }).waitFor();
  await page.screenshot({ path: path.join(artifacts, "05-verified-connection.png") });

  await page.getByRole("button", { name: /TRACE/ }).click();
  await page.locator(".trace-verdict").getByText("VERIFIED", { exact: true }).waitFor();
  await page.getByRole("button", { name: /RUN PRIVACY ATTACK/ }).click();
  await page.getByText(/DENIED \/ scope_exceeds_delegation/).waitFor();
  await page.screenshot({ path: path.join(artifacts, "06-trace-denied.png") });

  const finalState = await (await fetch("http://127.0.0.1:8765/api/demo")).json();
  if (finalState.stage !== "COMPLETED" || finalState.verification?.verdict !== "VERIFIED") {
    throw new Error(`Unexpected final state: ${finalState.stage} / ${finalState.verification?.verdict}`);
  }
  if (finalState.privacy_denials.at(-1)?.reason !== "scope_exceeds_delegation") {
    throw new Error("Privacy denial evidence missing");
  }
  if (!finalState.world_changed || finalState.evidence.length !== 2 || finalState.memory_updates.length !== 1) {
    throw new Error("World-change evidence or memory update missing");
  }
  if (consoleErrors.length) throw new Error(`Browser console errors:\n${consoleErrors.join("\n")}`);
  console.log(JSON.stringify({
    ui: "PASS",
    stage: finalState.stage,
    verdict: finalState.verification.verdict,
    privacy_denial: finalState.privacy_denials.at(-1).reason,
    candidates: finalState.candidates.map((candidate) => candidate.display_name),
    trace_events: finalState.trace.length,
    world_changed: finalState.world_changed,
    verified_actions: finalState.evidence.map((item) => item.label),
    memory_updated: finalState.memory_updates.length === 1,
    screenshots: 7,
    console_errors: 0,
  }, null, 2));
} finally {
  await browser.close();
}
