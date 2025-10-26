// cheatcode.ts
type Handler = (event: KeyboardEvent) => void;

type PatternInput =
  | string
  | string[]; // e.g. ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","KeyB","KeyA"]

interface Options {
  /** Ignore when focus is on inputs/textarea/contentEditable. Default: true */
  ignoreEditable?: boolean;
  /** Maximum interval (ms) between keys in the sequence; if exceeded, progress is reset. Default: undefined (no limit) */
  maxKeyDelayMs?: number;
  /** Allow detection while key is held down. Default: false (ignores event.repeat) */
  allowRepeat?: boolean;
  /** For auto-unsubscribe with AbortController */
  signal?: AbortSignal;
}

interface Subscription {
  unsubscribe(): void;
}

type Registration = {
  pattern: string[];
  handler: Handler;
  opts: Required<Options>;
  progress: number;
  lastTs: number | null;
};

const DEFAULT_OPTS: Required<Options> = {
  ignoreEditable: true,
  maxKeyDelayMs: undefined as unknown as number, // keep type; runtime we treat undefined
  allowRepeat: false,
  signal: undefined as unknown as AbortSignal,
};

const regs = new Set<Registration>();
let listening = false;

function isEditableTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea") return true;
  // contenteditable
  // @ts-ignore
  if ((el as any).isContentEditable) return true;
  return false;
}

function normalizeStringPattern(p: string): string[] {
  // If contains spaces, assume list of codes or words
  if (/\s/.test(p)) {
    return p
      .trim()
      .split(/\s+/)
      .map(tok => toCode(tok));
  }
  // Without spaces: expand char by char, let toCode handle all mappings
  return Array.from(p).map(ch => toCode(ch));
}

function toCode(tok: string): string {
  const lower = tok.toLowerCase();
  const alias: Record<string, string> = {
    // Arrow aliases
    "up": "ArrowUp",
    "down": "ArrowDown",
    "left": "ArrowLeft",
    "right": "ArrowRight",
    // Symbol mappings
    "↑": "ArrowUp",
    "↓": "ArrowDown",
    "←": "ArrowLeft",
    "→": "ArrowRight",
    // Letter aliases
    "a": "KeyA",
    "b": "KeyB",
    "A": "KeyA",
    "B": "KeyB",
  };
  
  // If already looks like KeyboardEvent.code, normalize it
  if (/^(Arrow(Up|Down|Left|Right)|Key[A-Z]|Digit[0-9]|Numpad[0-9]|Escape|Enter|Space|Tab|ShiftLeft|ShiftRight|ControlLeft|ControlRight|AltLeft|AltRight)$/i.test(tok)) {

    return tok.replace(/^key([a-z])/i, (_, c) => "Key" + c.toUpperCase())
              .replace(/^digit([0-9])/i, (_, d) => "Digit" + d)
              .replace(/^numpad([0-9])/i, (_, d) => "Numpad" + d)
              .replace(/^arrow(up|down|left|right)/i, (_, d) => "Arrow" + d.charAt(0).toUpperCase() + d.slice(1));
  }
  
  // Check alias first (handles both symbols and word aliases)
  if (alias[tok] || alias[lower]) {
    return alias[tok] || alias[lower];
  }
  // Default cases
  if (tok.length === 1 && /[a-z]/i.test(tok)) {
    return "Key" + tok.toUpperCase();
  }
  
  if (tok.length === 1 && /[0-9]/.test(tok)) {
    return "Digit" + tok;
  }
  
  return tok;
}

function normalizePattern(p: PatternInput): string[] {
  return Array.isArray(p) ? p.map(toCode) : normalizeStringPattern(p);
}

function ensureListener() {
  if (listening) return;
  window.addEventListener("keydown", onKeyDown, { capture: true });
  listening = true;
}

function maybeRemoveListener() {
  if (!listening) return;
  if (regs.size === 0) {
    window.removeEventListener("keydown", onKeyDown, { capture: true } as any);
    listening = false;
  }
}

function onKeyDown(ev: KeyboardEvent) {
  if (!DEFAULT_OPTS.allowRepeat && ev.repeat) return;

  // snapshot to iterate safely
  if (regs.size === 0) return;

  // Performance: early exits
  for (const reg of regs) {
    // Ignore editables
    if (reg.opts.ignoreEditable && isEditableTarget(ev.target)) continue;

    let code = ev.code || toGuessCode(ev);
    const now = ev.timeStamp || performance.now();
    if (code.startsWith("Numpad")) code = code.replace(/^Numpad/, "Digit");

    // Reset by delay
    if (reg.opts.maxKeyDelayMs !== (undefined as unknown as number) && reg.lastTs != null) {
      if (now - reg.lastTs > (reg.opts.maxKeyDelayMs as number)) {
        reg.progress = 0;
      }
    }

    // Progress advance
    const expected = reg.pattern[reg.progress];
    if (code === expected) {
      reg.progress++;
      reg.lastTs = now;
      if (reg.progress === reg.pattern.length) {
        // complete match
        reg.progress = 0;
        reg.lastTs = null;
        try {
          reg.handler(ev);
        } catch {
          // swallow to not break the page
        }
      }
    } else if (!code.startsWith("Shift") && !code.startsWith("Control") && !code.startsWith("Alt")) {
      // if doesn't match, see if restarts at 0 or 1 (KMP would be overkill; simple restart)
      reg.progress = code === reg.pattern[0] ? 1 : 0;
      reg.lastTs = reg.progress ? now : null;
    }
  }
}

function toGuessCode(ev: KeyboardEvent): string {
  // Fallback to old browsers
  const k = ev.key;
  if (k === " ") return "Space";
  if (k && k.length === 1 && /[a-z]/i.test(k)) return "Key" + k.toUpperCase();
  return k || "Unidentified";
}

/**
 * Registers a cheat code.
 * @returns Subscription with unsubscribe()
 */
export function onCheatCode(
  pattern: PatternInput,
  handler: Handler,
  opts: Options = {}
): Subscription {
  const norm = normalizePattern(pattern);
  const fullOpts: Required<Options> = { ...DEFAULT_OPTS, ...opts };
  const reg: Registration = {
    pattern: norm,
    handler,
    opts: fullOpts,
    progress: 0,
    lastTs: null,
  };
  regs.add(reg);
  ensureListener();

  // AbortSignal auto-unsubscribe
  if (fullOpts.signal) {
    const abort = () => sub.unsubscribe();
    if (fullOpts.signal.aborted) abort();
    else fullOpts.signal.addEventListener("abort", abort, { once: true });
  }

  const sub: Subscription = {
    unsubscribe() {
      regs.delete(reg);
      maybeRemoveListener();
    },
  };
  return sub;
}

// ———— Optional global shim for window ————
declare global {
  interface Window {
    onCheatCode?: typeof onCheatCode;
  }
}
if (typeof window !== "undefined" && !window.onCheatCode) {
  // attach in non-enumerable way to avoid clashing with other iterators
  Object.defineProperty(window, "onCheatCode", {
    value: onCheatCode,
    writable: false,
    enumerable: false,
    configurable: true,
  });
}

(function attachUMD() {
  // @ts-ignore
  const g = typeof globalThis !== "undefined" ? globalThis : (window as any);
  // Avoid overwriting if it already exists
  if (g && !g.Eggify) {
    g.Eggify = { onCheatCode };
  }
})();