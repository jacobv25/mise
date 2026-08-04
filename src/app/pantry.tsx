import { SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PantryRow } from '@/components/pantry-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { pantry } from '@/data/pantry';
import { useCookingSession } from '@/hooks/use-cooking-session';

/**
 * Sectioned pantry checklist (SectionList = FlatList + sticky-capable
 * section headers). Checks share the session store, so gathering
 * ingredients mid-cook survives tab switches.
 */
export default function PantryScreen() {
  const { checked, toggle } = useCookingSession('pantry');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <SectionList
          sections={pantry.map((section) => ({ title: section.title, data: section.items }))}
          keyExtractor={(item) => item.name}
          renderItem={({ item, section }) => {
            const key = `${section.title}:${item.name}`;
            return (
              <PantryRow item={item} checked={checked.has(key)} onToggle={() => toggle(key)} />
            );
          }}
          renderSectionHeader={({ section }) => (
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {section.title.toUpperCase()}
              </ThemedText>
            </ThemedView>
          )}
          ListHeaderComponent={
            <ThemedText type="subtitle" style={styles.header}>
              Pantry
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
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
});
