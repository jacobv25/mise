import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { formatSeconds, StepTimer } from '@/components/step-timer';

const DURATION = { minSeconds: 120, maxSeconds: 180, text: '2–3 min' };

// RNTL v14: render/fireEvent are async (concurrent React) — always await.
describe('StepTimer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('idle shows the duration as written; tap starts the countdown at the upper bound', async () => {
    await render(<StepTimer duration={DURATION} />);
    expect(screen.getByText('⏱ 2–3 min')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button'));
    expect(screen.getByText('⏱ 3:00')).toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(61_000));
    expect(screen.getByText('⏱ 1:59')).toBeOnTheScreen();
  });

  test('reaching zero flips to done; tapping again resets to idle', async () => {
    await render(<StepTimer duration={DURATION} />);
    await fireEvent.press(screen.getByRole('button'));
    await act(() => jest.advanceTimersByTime(180_000));
    expect(screen.getByText('⏱ time!')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button'));
    expect(screen.getByText('⏱ 2–3 min')).toBeOnTheScreen();
  });
});

describe('formatSeconds', () => {
  test('renders m:ss with zero-padded seconds', () => {
    expect(formatSeconds(180)).toBe('3:00');
    expect(formatSeconds(119)).toBe('1:59');
    expect(formatSeconds(9)).toBe('0:09');
    expect(formatSeconds(0)).toBe('0:00');
  });
});
