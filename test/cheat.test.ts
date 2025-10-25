import { test, expect, vi } from 'vitest';
import { onCheatCode } from '../src/index';

test('triggers handler on sequence', () => {
  const handler = vi.fn();
  onCheatCode("KeyA KeyB", handler);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB', bubbles: true }));
  expect(handler).toHaveBeenCalled();
});
