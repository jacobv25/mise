import { Pressable, StyleSheet, View } from 'react-native';

import { NutritionBadge } from '@/components/nutrition-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Recipe } from '@/types/recipe';

export type RecipeCardProps = {
  recipe: Recipe;
  onPress?: () => void;
};

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const subtitle = [recipe.cuisine, recipe.time].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText>{recipe.title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        ) : null}
        <View style={styles.badgeRow}>
          <NutritionBadge value={recipe.sodiumMg} unit=" mg" label="sodium" />
          <NutritionBadge value={recipe.proteinG} unit=" g" label="protein" />
          {recipe.status === 'to-try' && (
            <ThemedView type="backgroundSelected" style={styles.toTryChip}>
              <ThemedText type="small" themeColor="textSecondary">
                to try
              </ThemedText>
            </ThemedView>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  // Generous padding on purpose: kitchen use means wet fingers and glances
  // from a distance, so the whole card is the touch target.
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  toTryChip: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
});
