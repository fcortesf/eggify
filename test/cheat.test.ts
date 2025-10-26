import { test, expect, vi } from 'vitest';
import { onCheatCode } from '../src/index';

test('triggers handler on sequence', () => {
  const handler = vi.fn();
  onCheatCode("KeyA KeyB", handler);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB', bubbles: true }));
  expect(handler).toHaveBeenCalled();
});


test('triggers handler on word sequence', () => {
  const handler = vi.fn();
  onCheatCode("eggify", handler);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyI', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyY', bubbles: true }));
  expect(handler).toHaveBeenCalled();
});

test('not triggers handler on sequence', () => {
  const handler = vi.fn();
  onCheatCode("eggify", handler);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyI', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', bubbles: true }));
  expect(handler).toHaveBeenCalledTimes(0);
});

test('triggers handler on long key sequence', () => {
  const handler = vi.fn();
  onCheatCode("KeyE KeyG KeyG KeyI KeyF KeyY", handler);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyI', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyY', bubbles: true }));
  expect(handler).toHaveBeenCalled();
});

test('triggers handler on number key sequence', () => {
  const handler = vi.fn();
  onCheatCode("1 2 3 4 5", handler);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit2', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit3', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit4', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit5', bubbles: true }));
  expect(handler).toHaveBeenCalled();
});

test('triggers handler numpad on number key sequence', () => {
  const handler = vi.fn();
  onCheatCode("1 2 3 4 5", handler);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Numpad1', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Numpad2', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Numpad3', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Numpad4', bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Numpad5', bubbles: true }));
  expect(handler).toHaveBeenCalled();
});