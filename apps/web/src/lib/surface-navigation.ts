import type { SurfaceDestination } from "@/types/agent";

type Navigate = (surface: SurfaceDestination) => void;

export function focusTaskWorkspace(navigate: Navigate, behavior: ScrollBehavior = "smooth", runId?: string) {
  navigate({ kind: "workspace", runId });
  window.setTimeout(() => {
    const target = document.getElementById("task-workspace");
    if (!target) return;
    const top = target.offsetTop;
    window.scrollTo({ top, behavior });
    window.setTimeout(() => {
      if (Math.abs(target.getBoundingClientRect().top) > 40) window.scrollTo({ top, behavior: "auto" });
    }, behavior === "smooth" ? 700 : 40);
  }, 20);
}

export function focusSelfSpace(navigate: Navigate, behavior: ScrollBehavior = "smooth") {
  navigate({ kind: "self" });
  window.setTimeout(() => window.scrollTo({ top: 0, behavior }), 20);
}
