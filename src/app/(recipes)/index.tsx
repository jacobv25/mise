import { SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecipeCard } from '@/components/recipe-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { recipes } from '@/data/recipes';

/**
 * Kitchen recipes (made + to-try, exporter order), then the two drink tracks.
 * Mocktails get their own section rather than a chip: reaching for a drink you
 * can actually have is a different decision from browsing the bar.
 */
const sections = [
  { title: 'Kitchen', data: recipes.filter((r) => r.status === 'made' || r.status === 'to-try') },
  { title: 'Cocktails', data: recipes.filter((r) => r.status === 'cocktail') },
  { title: 'Mocktails', data: recipes.filter((r) => r.status === 'mocktail') },
].filter((section) => section.data.length > 0);

export default function RecipesScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <SectionList
          sections={sections}
          keyExtractor={(recipe) => recipe.id}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          renderSectionHeader={({ section }) => (
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionHeader}>
              {section.title.toUpperCase()}
            </ThemedText>
          )}
          ListHeaderComponent={
            <ThemedText type="subtitle" style={styles.header}>
              Recipes
            </ThemedText>
          }
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
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
  sectionHeader: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
});
