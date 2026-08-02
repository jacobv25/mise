import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type NutritionBadgeProps = {
  value: number | null;
  unit: string;
  label: string;
};

/** Small pill like "380 mg sodium"; renders nothing when the value is unknown. */
export function NutritionBadge({ value, unit, label }: NutritionBadgeProps) {
  if (value === null) {
    return null;
  }
  return (
    <ThemedView type="backgroundSelected" style={styles.badge}>
      <ThemedText type="smallBold">
        {value}
        {unit}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
});
