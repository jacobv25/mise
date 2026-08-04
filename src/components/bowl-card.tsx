import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Bowl } from '@/types/recipe';

const CIRCLED_DIGITS = '①②③④⑤⑥⑦⑧⑨⑩';

export type BowlCardProps = {
  bowl: Bowl;
  checked: boolean;
  onToggle: () => void;
};

/**
 * One mise-en-place bowl as a checkable card. The whole card is the touch
 * target (kitchen fingers); checking it marks the bowl as filled.
 */
export function BowlCard({ bowl, checked, onToggle }: BowlCardProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={checked ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.card, checked && styles.checkedCard]}>
        <View style={styles.headerRow}>
          <ThemedText type="subtitle" style={styles.digit}>
            {CIRCLED_DIGITS[bowl.index - 1] ?? bowl.index}
          </ThemedText>
          <View style={styles.headerText}>
            <ThemedText type="smallBold">{bowl.name}</ThemedText>
            {bowl.targetStep !== null && (
              <ThemedText type="small" themeColor="textSecondary">
                → step {bowl.targetStep}
              </ThemedText>
            )}
          </View>
          <ThemedText type="subtitle" style={styles.checkmark}>
            {checked ? '✓' : ''}
          </ThemedText>
        </View>
        {bowl.items.map((item) => (
          <ThemedText
            key={item}
            type="small"
            themeColor={checked ? 'textSecondary' : 'text'}
            style={checked && styles.checkedItem}>
            {'•'} {item}
          </ThemedText>
        ))}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  checkedCard: {
    opacity: 0.75,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  digit: {
    fontSize: 28,
    lineHeight: 34,
  },
  headerText: {
    flex: 1,
  },
  checkmark: {
    fontSize: 24,
    lineHeight: 30,
    minWidth: 28,
    textAlign: 'center',
  },
  checkedItem: {
    textDecorationLine: 'line-through',
  },
});
