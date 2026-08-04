import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BowlCard } from '@/components/bowl-card';
import { StepRow } from '@/components/step-row';
import { NutritionTile } from '@/components/nutrition-tile';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { recipes } from '@/data/recipes';
import { useCookingSession } from '@/hooks/use-cooking-session';

export default function RecipeDetailScreen() {
  // The kitchen screen: stay awake while a recipe is open — wet hands
  // shouldn't have to tap the phone to keep it lit.
  useKeepAwake();

  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipes.find((r) => r.id === id);
  const { checked, toggle } = useCookingSession(id ?? 'unknown');

  if (!recipe) {
    return (
      <ThemedView style={styles.missing}>
        <ThemedText>Recipe not found.</ThemedText>
      </ThemedView>
    );
  }

  const meta = [recipe.cuisine, recipe.time, recipe.serves && `serves ${recipe.serves}`]
    .filter(Boolean)
    .join(' · ');
  const hasMise = recipe.bowls.length > 0;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: recipe.title }} />
      <ScrollView contentContainerStyle={styles.content}>
        {meta ? (
          <ThemedText type="small" themeColor="textSecondary">
            {meta}
          </ThemedText>
        ) : null}

        <View style={styles.tileRow}>
          <NutritionTile value={recipe.sodiumMg} unit="mg" label="sodium" />
          <NutritionTile value={recipe.proteinG} unit="g" label="protein" />
          <NutritionTile value={recipe.calories} unit="kcal" label="calories" />
        </View>

        {hasMise ? (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Mise en place
            </ThemedText>
            {recipe.tools.length > 0 && (
              <ThemedView type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold">Tools & station</ThemedText>
                {recipe.tools.map((tool) => {
                  const key = `tool:${tool}`;
                  const isChecked = checked.has(key);
                  return (
                    <Pressable
                      key={tool}
                      onPress={() => toggle(key)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isChecked }}
                      style={({ pressed }) => [styles.toolRow, pressed && styles.pressed]}>
                      <ThemedText type="small" style={styles.toolCheck}>
                        {isChecked ? '✓' : '○'}
                      </ThemedText>
                      <ThemedText
                        type="small"
                        themeColor={isChecked ? 'textSecondary' : 'text'}
                        style={[styles.toolLabel, isChecked && styles.checkedItem]}>
                        {tool}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ThemedView>
            )}
            {recipe.bowls.map((bowl) => {
              const key = `bowl:${bowl.index}`;
              return (
                <BowlCard
                  key={bowl.index}
                  bowl={bowl}
                  checked={checked.has(key)}
                  onToggle={() => toggle(key)}
                />
              );
            })}
            {recipe.stationExtras.map((extra) => (
              <ThemedView key={extra.label} type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold">
                  {extra.label}
                  {extra.arrowText ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {'  '}→ {extra.arrowText}
                    </ThemedText>
                  ) : null}
                </ThemedText>
                {extra.items.map((item) => (
                  <ThemedText key={item} type="small">
                    {'•'} {item}
                  </ThemedText>
                ))}
              </ThemedView>
            ))}
          </>
        ) : recipe.ingredients.length > 0 ? (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Ingredients
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.card}>
              {recipe.ingredients.map((item) => (
                <ThemedText key={item} type="small">
                  {'•'} {item}
                </ThemedText>
              ))}
            </ThemedView>
          </>
        ) : null}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Steps
        </ThemedText>
        <View style={styles.steps}>
          {recipe.steps.map((step) => (
            <StepRow key={step.number} step={step} />
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  tileRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
    marginTop: Spacing.three,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  toolCheck: {
    minWidth: 20,
    textAlign: 'center',
  },
  toolLabel: {
    flex: 1,
  },
  checkedItem: {
    textDecorationLine: 'line-through',
  },
  steps: {
    gap: Spacing.three,
  },
});
