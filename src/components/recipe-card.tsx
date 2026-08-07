import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { NutritionBadge } from '@/components/nutrition-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Recipe } from '@/types/recipe';

export type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const subtitle = [recipe.cuisine, recipe.time].filter(Boolean).join(' · ');

  return (
    <Link href={{ pathname: '/recipe/[id]', params: { id: recipe.id } }} asChild>
      <Pressable style={({ pressed }) => pressed && styles.pressed}>
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
          {recipe.status !== 'made' && (
            <ThemedView type="backgroundSelected" style={styles.statusChip}>
              <ThemedText type="small" themeColor="textSecondary">
                {recipe.status === 'to-try' ? 'to try' : 'cocktail'}
              </ThemedText>
            </ThemedView>
          )}
        </View>
      </ThemedView>
      </Pressable>
    </Link>
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
  statusChip: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
});
