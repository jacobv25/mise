import { fireEvent, render, screen } from '@testing-library/react-native';

import { BowlCard } from '@/components/bowl-card';
import type { Bowl } from '@/types/recipe';

const BOWL: Bowl = {
  index: 2,
  name: 'Spices',
  arrowText: '→ pan at step 5, on the aromatics',
  targetSteps: [5],
  items: ['1 tsp dried oregano', '¼ tsp chili flakes'],
};

// RNTL v14: render/fireEvent are async (concurrent React) — always await.
describe('BowlCard', () => {
  test('renders circled digit, name, target step, and every item', async () => {
    await render(<BowlCard bowl={BOWL} checked={false} onToggle={jest.fn()} />);
    expect(screen.getByText('②')).toBeOnTheScreen();
    expect(screen.getByText('Spices')).toBeOnTheScreen();
    expect(screen.getByText('→ step 5')).toBeOnTheScreen();
    expect(screen.getByText(/dried oregano/)).toBeOnTheScreen();
    expect(screen.getByText(/chili flakes/)).toBeOnTheScreen();
  });

  test('pressing the card fires onToggle', async () => {
    const onToggle = jest.fn();
    await render(<BowlCard bowl={BOWL} checked={false} onToggle={onToggle} />);
    await fireEvent.press(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('exposes checked state to accessibility and shows the checkmark', async () => {
    await render(<BowlCard bowl={BOWL} checked onToggle={jest.fn()} />);
    expect(screen.getByRole('checkbox', { checked: true })).toBeOnTheScreen();
    expect(screen.getByText('✓')).toBeOnTheScreen();
  });

  test('pluralizes a two-stage bowl\'s targets ("→ steps 4 & 5")', async () => {
    await render(
      <BowlCard bowl={{ ...BOWL, targetSteps: [4, 5] }} checked={false} onToggle={jest.fn()} />,
    );
    expect(screen.getByText('→ steps 4 & 5')).toBeOnTheScreen();
  });

  test('omits the step target when the bowl has none (contract-violation tolerance)', async () => {
    await render(
      <BowlCard bowl={{ ...BOWL, targetSteps: [] }} checked={false} onToggle={jest.fn()} />,
    );
    expect(screen.queryByText(/→ step/)).toBeNull();
  });
});
