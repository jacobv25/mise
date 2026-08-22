import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { StepDuration } from '@/types/recipe';

/** m:ss for the countdown display, e.g. 180 → "3:00", 59 → "0:59". */
export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Tap-to-start countdown for a step's lead-in duration. Counts down from
 * the range's upper bound; tapping mid-run or after it finishes resets.
 * State is local — mount it with a per-step key so changing steps resets.
 */
export function StepTimer({ duration }: { duration: StepDuration }) {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(duration.maxSeconds);
  const done = running && remaining === 0;

  // `remaining` in the deps re-arms the interval each tick and, more to
  // the point, disarms it once the countdown bottoms out.
  useEffect(() => {
    if (!running || remaining === 0) return;
    const tick = setInterval(() => setRemaining((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(tick);
  }, [running, remaining]);

  const onPress = () => {
    if (running) {
      setRunning(false);
      setRemaining(duration.maxSeconds);
    } else {
      setRunning(true);
    }
  };

  const label = !running ? `⏱ ${duration.text}` : done ? '⏱ time!' : `⏱ ${formatSeconds(remaining)}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type={running ? 'backgroundSelected' : 'backgroundElement'} style={styles.chip}>
        <ThemedText type="code">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
});
