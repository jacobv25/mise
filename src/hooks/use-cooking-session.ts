import { useCallback, useState } from 'react';

/**
 * Checked-off state for a recipe's mise/tools checklist, scoped to the
 * app session: module state survives navigating away and back mid-cook,
 * and resets when the app restarts. (Durable persistence — surviving an
 * app kill — would swap this Map for AsyncStorage; deliberately out of
 * scope for M2.)
 */
const sessions = new Map<string, ReadonlySet<string>>();

export function useCookingSession(recipeId: string) {
  const [checked, setChecked] = useState<ReadonlySet<string>>(
    () => sessions.get(recipeId) ?? new Set(),
  );

  const toggle = useCallback(
    (key: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        sessions.set(recipeId, next);
        return next;
      });
    },
    [recipeId],
  );

  return { checked, toggle };
}
