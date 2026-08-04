import { act, renderHook } from '@testing-library/react-native';

import { useCookingSession } from '@/hooks/use-cooking-session';

// RNTL v14: renderHook/act/unmount are async (concurrent React) — always await.
describe('useCookingSession', () => {
  test('toggle checks and unchecks a key', async () => {
    const { result } = await renderHook(() => useCookingSession('r1'));
    expect(result.current.checked.has('bowl:1')).toBe(false);

    await act(() => result.current.toggle('bowl:1'));
    expect(result.current.checked.has('bowl:1')).toBe(true);

    await act(() => result.current.toggle('bowl:1'));
    expect(result.current.checked.has('bowl:1')).toBe(false);
  });

  test('state survives unmount/remount (navigating away mid-cook)', async () => {
    const first = await renderHook(() => useCookingSession('r2'));
    await act(() => first.result.current.toggle('bowl:3'));
    await first.unmount();

    const second = await renderHook(() => useCookingSession('r2'));
    expect(second.result.current.checked.has('bowl:3')).toBe(true);
  });

  test('recipes have independent checklists', async () => {
    const a = await renderHook(() => useCookingSession('r3'));
    await act(() => a.result.current.toggle('tool:pan'));

    const b = await renderHook(() => useCookingSession('r4'));
    expect(b.result.current.checked.has('tool:pan')).toBe(false);
  });
});
