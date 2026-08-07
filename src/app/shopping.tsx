import { SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChecklistRow } from '@/components/checklist-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { shopping } from '@/data/shopping';
import { useCookingSession } from '@/hooks/use-cooking-session';

/**
 * Kitchen shopping run — the pantry's running shopping list as a
 * checklist, same shape as the bar run. The bar's bottles and tools
 * stay in their own tab (with their own checks); the footer points
 * there since one trip usually covers both.
 */
export default function ShoppingScreen() {
  const { checked, toggle } = useCookingSession('shopping');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <SectionList
          sections={shopping.map((section) => ({
            title: section.title,
            note: section.note,
            data: section.items,
          }))}
          keyExtractor={(item) => item.name}
          renderItem={({ item, section }) => {
            const key = `${section.title}:${item.name}`;
            return (
              <ChecklistRow item={item} checked={checked.has(key)} onToggle={() => toggle(key)} />
            );
          }}
          renderSectionHeader={({ section }) => (
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {section.title.toUpperCase()}
              </ThemedText>
              {section.note && (
                <ThemedText type="small" themeColor="textSecondary">
                  {section.note}
                </ThemedText>
              )}
            </ThemedView>
          )}
          ListHeaderComponent={
            <ThemedText type="subtitle" style={styles.header}>
              Shopping
            </ThemedText>
          }
          ListFooterComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
              🍸 Bottles & bar tools live in the Bar tab — one trip can cover both.
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
    gap: Spacing.half,
  },
  footer: {
    paddingTop: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
});
