import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeCard } from '@/components/recipe-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { recipes } from '@/data/recipes';

export default function RecipesScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <FlatList
          data={recipes}
          keyExtractor={(recipe) => recipe.id}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          ListHeaderComponent={
            <ThemedText type="subtitle" style={styles.header}>
              Recipes
            </ThemedText>
          }
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  header: {
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
});
