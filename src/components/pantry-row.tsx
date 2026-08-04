import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { PantryItem } from '@/types/pantry';

export type PantryRowProps = {
  item: PantryItem;
  checked: boolean;
  onToggle: () => void;
};

/** One checkable pantry line: ○/✓, name, ⚠️ sodium-watch, use-first chip. */
export function PantryRow({ item, checked, onToggle }: PantryRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <ThemedText type="small" style={styles.check}>
        {checked ? '✓' : '○'}
      </ThemedText>
      <ThemedText
        type="small"
        themeColor={checked ? 'textSecondary' : 'text'}
        style={[styles.name, checked && styles.checkedName]}>
        {item.name}
        {item.warn ? ' ⚠️' : ''}
      </ThemedText>
      {item.useFirst && (
        <ThemedView type="backgroundSelected" style={styles.chip}>
          <ThemedText type="small" themeColor="textSecondary">
            use first
          </ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    // Tall rows on purpose — kitchen touch targets.
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  check: {
    minWidth: 22,
    textAlign: 'center',
  },
  name: {
    flexShrink: 1,
  },
  checkedName: {
    textDecorationLine: 'line-through',
  },
  chip: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
});
