import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type NutritionTileProps = {
  value: number | null;
  unit: string;
  label: string;
};

/** One big-number stat card for the detail header row; hidden when unknown. */
export function NutritionTile({ value, unit, label }: NutritionTileProps) {
  if (value === null) {
    return null;
  }
  return (
    <ThemedView type="backgroundElement" style={styles.tile}>
      <ThemedText type="subtitle" style={styles.value}>
        {value}
        <ThemedText type="small" themeColor="textSecondary">
          {' '}
          {unit}
        </ThemedText>
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  value: {
    fontSize: 26,
    lineHeight: 32,
  },
});
