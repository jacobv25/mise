import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { ChecklistItem } from '@/types/checklist';

export type ChecklistRowProps = {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
};

/** One checkable shopping line: ○/✓, name + optional chip, price/brand detail below. */
export function ChecklistRow({ item, checked, onToggle }: ChecklistRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <ThemedText type="small" style={styles.check}>
        {checked ? '✓' : '○'}
      </ThemedText>
      <View style={styles.body}>
        <View style={styles.nameLine}>
          <ThemedText
            type="smallBold"
            themeColor={checked ? 'textSecondary' : 'text'}
            style={[styles.name, checked && styles.strike]}>
            {item.name}
          </ThemedText>
          {item.optional && (
            <ThemedView type="backgroundSelected" style={styles.chip}>
              <ThemedText type="small" themeColor="textSecondary">
                optional
              </ThemedText>
            </ThemedView>
          )}
        </View>
        {item.detail && (
          <ThemedText type="small" themeColor="textSecondary" style={checked && styles.strike}>
            {item.detail}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    // Tall rows on purpose — same store-aisle touch targets as the pantry.
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  check: {
    minWidth: 22,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  chip: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
});
