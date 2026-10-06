import { type Project, validateProject } from './model';
import { produce, setAutoFreeze } from 'immer';
setAutoFreeze(false);
export type Command = { label: string; before: Project; after: Project };
export class ProjectHistory {
  private undoStack: Command[] = []; private redoStack: Command[] = [];
  constructor(public current: Project) {}
  commit(label: string, change: (draft: Project) => void) {
    const before = this.current, after = produce(before, draft => { change(draft as Project); draft.updatedAt = new Date().toISOString(); });
    this.current = after; this.undoStack.push({ label, before, after }); this.redoStack = [];
    // Keep a bounded history; immutable shared asset data avoids copying pixel buffers.
    if (this.undoStack.length > 60) this.undoStack.shift(); return this.current;
  }
  undo() { const c = this.undoStack.pop(); if (c) { this.redoStack.push(c); this.current = c.before; } return this.current; }
  redo() { const c = this.redoStack.pop(); if (c) { this.undoStack.push(c); this.current = c.after; } return this.current; }
  get canUndo() { return !!this.undoStack.length; } get canRedo() { return !!this.redoStack.length; }
  reset(project: Project) { this.current = validateProject(project); this.undoStack = []; this.redoStack = []; }
}
