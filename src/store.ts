import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { emptyState, parseAutomation, validate } from './automations/model.ts';
import type { Automation, Run, State } from './automations/model.ts';
export interface ExecutionAdapter { start(definition: Automation): Promise<Run> }
export class RequestError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export class Store {
  file: string; adapter?: ExecutionAdapter; queue: Promise<unknown> = Promise.resolve();
  constructor(file: string, adapter?: ExecutionAdapter) { this.file = file; this.adapter = adapter; }
  async read(): Promise<State> {
    try {
      const state: State = JSON.parse(await readFile(this.file, 'utf8'));
      if (!Array.isArray(state.automations) || !Array.isArray(state.runs)) throw Error('Invalid store.');
      return { automations: state.automations.map(parseAutomation), runs: state.runs };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyState();
      throw error;
    }
  }
  change<T>(update: (state: State) => T | Promise<T>): Promise<T> {
    const action = this.queue.then(async () => {
      const state = await this.read(), result = await update(state);
      await mkdir(dirname(this.file), { recursive: true, mode: 0o700 });
      const temp = `${this.file}.${randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(state), { mode: 0o600 });
      await rename(temp, this.file);
      return result;
    });
    this.queue = action.catch(() => undefined);
    return action;
  }
  save(input: unknown): Promise<Automation> {
    const a = parseAutomation(input), errors = validate(a);
    if (errors.length) throw new RequestError(400, errors.join(' '));
    return this.change(state => {
      const old = state.automations.find(v => v.id === a.id);
      if (a.id && !old) throw new RequestError(404, 'Automation not found.');
      if (old && old.revision !== a.revision) throw new RequestError(409, 'Changed elsewhere. Reload before saving.');
      const saved = { ...a, id: old?.id ?? randomUUID(), revision: (old?.revision ?? 0) + 1,
        createdAt: old?.createdAt ?? new Date().toISOString() };
      state.automations = [...state.automations.filter(v => v.id !== saved.id), saved];
      return saved;
    });
  }
  remove(id: string, revision: number): Promise<void> {
    return this.change(state => {
      const old = state.automations.find(a => a.id === id);
      if (!old) throw new RequestError(404, 'Automation not found.');
      if (old.revision !== revision) throw new RequestError(409, 'Changed elsewhere. Reload before deleting.');
      state.automations = state.automations.filter(a => a.id !== id);
    });
  }
  async start(id: string): Promise<Run> {
    if (!this.adapter) throw new RequestError(501, 'Execution adapter not connected. No run was started.');
    const a = (await this.read()).automations.find(a => a.id === id);
    if (!a) throw new RequestError(404, 'Automation not found.');
    const errors = validate({ ...a, enabled: true });
    if (errors.length) throw new RequestError(400, errors.join(' '));
    const run = await this.adapter.start(structuredClone(a));
    await this.change(s => { s.runs.push(run); });
    return run;
  }
}
