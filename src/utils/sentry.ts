import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

import { useSettings } from '@/stores/settings';

/**
 * Where crash reports go. Not a secret: it's in every build anyway. Kept here as well as in the environment, because
 * OTA updates (eas update) don't get the build profile's variables.
 */
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? 'https://755f445790cc440eb625404426d380d7@o1136798.ingest.sentry.io/6188926';

/** Records screen changes, so a crash report says which screen it happened on */
export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

/**
 * Crash and error reports to Sentry, from release builds only. Nothing that identifies the user is attached (no IP
 * address, no device name), and nothing is sent when crash reports are turned off in the settings. A tenth of
 * sessions also report how long screens take to load.
 */
export function initSentry() {
  Sentry.init({
    dsn: DSN,
    enabled: !__DEV__,
    sendDefaultPii: false,
    // Screen load times from a sample of sessions; errors are always reported
    tracesSampleRate: 0.1,
    integrations: [ navigationIntegration ],
    enableNativeFramesTracking: !isRunningInExpoGo(),
    // Set in the app's settings. Before the saved settings have loaded this is the default (on)
    beforeSend: event => (useSettings.getState().crashReports ? event : null),
    beforeSendTransaction: event => (useSettings.getState().crashReports ? event : null),
  });
}

export { Sentry };
