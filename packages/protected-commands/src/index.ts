export type ProtectedCommandName = `protected.${string}`;

export interface ApprovalContext {
  runId: string;
  stage: string;
}

export interface CommandPolicy {
  command: ProtectedCommandName;
  stages: readonly string[];
}

export interface CommandTicket extends ApprovalContext {
  command: ProtectedCommandName;
  nonce: string;
  issuedAt: number;
}

export type ProtectedCommandResult =
  | { ok: true }
  | { ok: false; reason: "unknown-command" | "wrong-run" | "wrong-stage" | "invalid-ticket" | "replayed-ticket" };

const randomNonce = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export class ProtectedCommandDispatcher {
  readonly #policies = new Map<ProtectedCommandName, CommandPolicy>();
  readonly #tickets = new Map<string, CommandTicket>();
  readonly #consumed = new Set<string>();

  constructor(policies: readonly CommandPolicy[]) {
    for (const policy of policies) {
      if (!policy.command.startsWith("protected.") || this.#policies.has(policy.command)) throw new Error(`invalid protected command policy: ${policy.command}`);
      this.#policies.set(policy.command, Object.freeze({ ...policy, stages: [...policy.stages] }));
    }
  }

  issue(command: ProtectedCommandName, context: ApprovalContext): CommandTicket {
    const policy = this.#policies.get(command);
    if (!policy) throw new Error(`unknown protected command: ${command}`);
    if (!policy.stages.includes(context.stage)) throw new Error(`command ${command} is not allowed at ${context.stage}`);
    const ticket = Object.freeze({ command, ...context, nonce: randomNonce(), issuedAt: Date.now() });
    this.#tickets.set(ticket.nonce, ticket);
    return ticket;
  }

  async execute(ticket: CommandTicket, current: ApprovalContext, executor: () => void | Promise<void>): Promise<ProtectedCommandResult> {
    const policy = this.#policies.get(ticket.command);
    if (!policy) return { ok: false, reason: "unknown-command" };
    if (this.#consumed.has(ticket.nonce)) return { ok: false, reason: "replayed-ticket" };
    const issued = this.#tickets.get(ticket.nonce);
    if (!issued || issued !== ticket) return { ok: false, reason: "invalid-ticket" };
    if (ticket.runId !== current.runId) return { ok: false, reason: "wrong-run" };
    if (ticket.stage !== current.stage || !policy.stages.includes(current.stage)) return { ok: false, reason: "wrong-stage" };
    this.#consumed.add(ticket.nonce);
    this.#tickets.delete(ticket.nonce);
    await executor();
    return { ok: true };
  }
}
