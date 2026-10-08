import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function LoadingView({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
      {label ? <Text variant="bodyMedium" style={styles.label}>{label}</Text> : null}
    </View>
  );
}

interface MessageViewProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function MessageView({ icon, title, message, actionLabel, onAction }: MessageViewProps) {
  const theme = useTheme();
  return (
    <View style={styles.center}>
      <MaterialCommunityIcons name={icon} size={48} color={theme.colors.onSurfaceVariant} />
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {message ? <Text variant="bodyMedium" style={[ styles.label, { color: theme.colors.onSurfaceVariant } ]}>{message}</Text> : null}
      {actionLabel && onAction ? <Button mode="contained-tonal" onPress={onAction} style={styles.action}>{actionLabel}</Button> : null}
    </View>
  );
}

export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <MessageView
      icon="alert-circle-outline"
      title="Couldn't load data"
      message={message}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  label: {
    textAlign: 'center',
  },
  action: {
    marginTop: 12,
  },
});
