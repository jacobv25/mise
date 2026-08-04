import { StyleSheet, View } from 'react-native';

import { HeatChip } from '@/components/heat-chip';
import { MarkdownText } from '@/components/markdown-text';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Step } from '@/types/recipe';

/**
 * One numbered step: heat chip + bold lead-in as the title, remaining
 * prose as the body. To-try recipes have no lead-ins — the whole text
 * renders as the body.
 */
export function StepRow({ step }: { step: Step }) {
  const body = step.leadIn
    ? step.text.replace(`**${step.leadIn}**`, '').trim()
    : step.text;

  return (
    <View style={styles.row}>
      <ThemedText type="subtitle" themeColor="textSecondary" style={styles.number}>
        {step.number}
      </ThemedText>
      <View style={styles.content}>
        <HeatChip heat={step.heat} />
        {step.leadIn ? <ThemedText type="smallBold">{step.leadIn}</ThemedText> : null}
        {body ? <MarkdownText type="small">{body}</MarkdownText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  number: {
    fontSize: 22,
    lineHeight: 28,
    minWidth: 24,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
});
