import { StyleSheet } from 'react-native';

import { ThemedText, type ThemedTextProps } from '@/components/themed-text';

/**
 * Renders the small markdown subset the recipe files actually use —
 * **bold** and *italic* — as nested Text spans. Not a general markdown
 * renderer; anything else passes through literally.
 */
export function MarkdownText({ children, ...rest }: ThemedTextProps & { children: string }) {
  const segments = children.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <ThemedText {...rest}>
      {segments.map((segment, i) => {
        if (segment.startsWith('**') && segment.endsWith('**')) {
          return (
            <ThemedText key={i} style={styles.bold}>
              {segment.slice(2, -2)}
            </ThemedText>
          );
        }
        if (segment.startsWith('*') && segment.endsWith('*')) {
          return (
            <ThemedText key={i} themeColor="textSecondary" style={styles.italic}>
              {segment.slice(1, -1)}
            </ThemedText>
          );
        }
        return segment;
      })}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
});
