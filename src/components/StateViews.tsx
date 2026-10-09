import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Pill } from '@/components/quiet/Controls';
import { Text } from '@/components/quiet/Text';
import { GUTTER, q } from '@/theme';

interface MessageViewProps {
  title: string;
  message?: string;
  tone?: 'default' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
}

/** Large, left-aligned message for empty and error states. */
export function MessageView({ title, message, tone = 'default', actionLabel, onAction }: MessageViewProps) {
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.wrap}>
      <Text size={30} weight="extralight" tracking={-0.03} leading={1.15} color={tone === 'danger' ? q.danger : q.text}>{title}</Text>
      {message ? <Text size={15} color={q.muted} leading={1.6}>{message}</Text> : null}
      {actionLabel && onAction ? <Pill label={actionLabel} variant="ghost" onPress={onAction} style={styles.action} /> : null}
    </Animated.View>
  );
}

export function ErrorView({ title = 'Couldn\'t load this', error, onRetry }: { title?: string; error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <View style={styles.flex}>
      <MessageView title={message} message={title} tone="danger" actionLabel={onRetry ? 'Try again' : undefined} onAction={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  wrap: {
    paddingHorizontal: GUTTER,
    paddingVertical: 48,
    gap: 12,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
});
