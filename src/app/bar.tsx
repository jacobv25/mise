import { SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarRow } from '@/components/bar-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { bar } from '@/data/bar';
import { useCookingSession } from '@/hooks/use-cooking-session';

/**
 * Bar shopping checklist — same SectionList shape as the pantry, but
 * rows keep their price/brand detail (that's what you read in the
 * aisle) and sections can carry an intro note from bar.md.
 */
export default function BarScreen() {
  const { checked, toggle } = useCookingSession('bar');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <SectionList
          sections={bar.map((section) => ({
            title: section.title,
            note: section.note,
            data: section.items,
          }))}
          keyExtractor={(item) => item.name}
          renderItem={({ item, section }) => {
            const key = `${section.title}:${item.name}`;
            return <BarRow item={item} checked={checked.has(key)} onToggle={() => toggle(key)} />;
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
              Bar run
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
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
});
