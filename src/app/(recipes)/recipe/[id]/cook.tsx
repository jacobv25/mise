import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BowlCard } from '@/components/bowl-card';
import { HeatChip } from '@/components/heat-chip';
import { MarkdownText } from '@/components/markdown-text';
import { StepTimer } from '@/components/step-timer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { recipes } from '@/data/recipes';
import { standingExtras, stationForStep } from '@/data/step-station';
import { useCookingSession } from '@/hooks/use-cooking-session';
import { useTheme } from '@/hooks/use-theme';

/**
 * Cook mode: one step per screen, kitchen-sized type, and the step's own
 * ingredients inline (via stationForStep) so there's no jumping back to
 * the mise section mid-cook. Bowl checks share the detail screen's
 * cooking session, so tipping a bowl in marks it filled there too.
 */
export default function CookModeScreen() {
  // The whole point of cook mode: the screen must survive wet hands
  // and long sears without being touched.
  useKeepAwake();

  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipes.find((r) => r.id === id);
  const { checked, toggle } = useCookingSession(id ?? 'unknown');
  const [index, setIndex] = useState(0);

  if (!recipe || recipe.steps.length === 0) {
    return (
      <ThemedView style={styles.missing}>
        <ThemedText>Nothing to cook here.</ThemedText>
      </ThemedView>
    );
  }

  const step = recipe.steps[index];
  const { bowls, extras } = stationForStep(recipe, step.number);
  const standing = standingExtras(recipe).filter((e) => e.items.length > 0);
  const isFirst = index === 0;
  const isLast = index === recipe.steps.length - 1;
  const body = step.leadIn ? step.text.replace(`**${step.leadIn}**`, '').trim() : step.text;

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Step ${step.number} of ${recipe.steps.length}`,
        }}
      />
      {/* Keyed by step so a new step remounts the scroll at the top. */}
      <ScrollView key={step.number} contentContainerStyle={styles.content}>
        <ThemedText type="small" themeColor="textSecondary">
          {recipe.title}
        </ThemedText>

        {(step.heat || step.duration) && (
          <View style={styles.chipRow}>
            <HeatChip heat={step.heat} />
            {step.duration && <StepTimer duration={step.duration} />}
          </View>
        )}

        {step.leadIn ? <ThemedText style={styles.leadIn}>{step.leadIn}</ThemedText> : null}
        {body ? <MarkdownText style={styles.body}>{body}</MarkdownText> : null}

        {(bowls.length > 0 || extras.length > 0) && (
          <>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.stationTitle}>
              Goes in now
            </ThemedText>
            {bowls.map((bowl) => {
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
            {extras.map((extra) => (
              <ThemedView key={extra.label} type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold">{extra.label}</ThemedText>
                {extra.items.map((item) => (
                  <ThemedText key={item} type="small">
                    {'•'} {item}
                  </ThemedText>
                ))}
              </ThemedView>
            ))}
          </>
        )}

        {standing.length > 0 && (
          <View style={styles.standing}>
            {standing.map((extra) => (
              <ThemedText key={extra.label} type="small" themeColor="textSecondary">
                {extra.label}: {extra.items.join(' · ')}
              </ThemedText>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.nav}>
        <Pressable
          onPress={() => setIndex((i) => i - 1)}
          disabled={isFirst}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.navButton,
            { backgroundColor: theme.backgroundElement },
            isFirst && styles.navDisabled,
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" style={styles.navLabel}>
            Back
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => (isLast ? router.back() : setIndex((i) => i + 1))}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.navButton,
            styles.navPrimary,
            { backgroundColor: theme.text },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" style={[styles.navLabel, { color: theme.background }]}>
            {isLast ? 'Done' : 'Next step'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  leadIn: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: 700,
    marginTop: Spacing.one,
  },
  body: {
    fontSize: 19,
    lineHeight: 29,
  },
  stationTitle: {
    marginTop: Spacing.three,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  standing: {
    marginTop: Spacing.two,
    gap: Spacing.half,
  },
  nav: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  navButton: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.three,
  },
  navPrimary: {
    flex: 2,
  },
  navDisabled: {
    opacity: 0.35,
  },
  navLabel: {
    fontSize: 18,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.7,
  },
});
