import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/** Pill showing a step's heat token, e.g. MEDIUM-HIGH · OFF HEAT · no heat. */
export function HeatChip({ heat }: { heat: string | null }) {
  if (!heat) {
    return null;
  }
  return (
    <ThemedView type="backgroundSelected" style={styles.chip}>
      <ThemedText type="code">{heat}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
});
