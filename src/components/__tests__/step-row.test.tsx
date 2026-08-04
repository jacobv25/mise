import { render, screen } from '@testing-library/react-native';

import { StepRow } from '@/components/step-row';
import type { Step } from '@/types/recipe';

// RNTL v14: render is async (concurrent React) — always await.
describe('StepRow', () => {
  test('made-recipe step: heat chip, lead-in title, body without the lead-in', async () => {
    const step: Step = {
      number: 3,
      text: '**Preheat — MEDIUM-HIGH, 2–3 min.** Water-drop test, then add the oil.',
      leadIn: 'Preheat — MEDIUM-HIGH, 2–3 min.',
      heat: 'MEDIUM-HIGH',
    };
    await render(<StepRow step={step} />);
    expect(screen.getByText('3')).toBeOnTheScreen();
    expect(screen.getByText('MEDIUM-HIGH')).toBeOnTheScreen();
    expect(screen.getByText('Preheat — MEDIUM-HIGH, 2–3 min.')).toBeOnTheScreen();
    expect(screen.getByText(/Water-drop test/)).toBeOnTheScreen();
  });

  test('to-try step: no lead-in, no heat chip, plain text body', async () => {
    const step: Step = {
      number: 1,
      text: 'Rinse lentils until water runs clear.',
      leadIn: null,
      heat: null,
    };
    await render(<StepRow step={step} />);
    expect(screen.getByText('Rinse lentils until water runs clear.')).toBeOnTheScreen();
    expect(screen.queryByText(/HEAT|MEDIUM|HIGH|LOW/)).toBeNull();
  });

  test('body renders **bold** emphasis as styled text, not literal asterisks', async () => {
    const step: Step = {
      number: 4,
      text: '**Brown — MEDIUM-HIGH.** Press flat, then **don’t touch for 3–4 min**.',
      leadIn: 'Brown — MEDIUM-HIGH.',
      heat: 'MEDIUM-HIGH',
    };
    await render(<StepRow step={step} />);
    expect(screen.getByText(/don’t touch for 3–4 min/)).toBeOnTheScreen();
    expect(screen.queryByText(/\*\*/)).toBeNull();
  });
});
