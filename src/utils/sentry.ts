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

let started = false;

/**
 * Crash and error reports to Sentry, from release builds only. Nothing that identifies the user is attached (no IP
 * address, no device name). A tenth of sessions also report how long screens take to load.
 * Started once the saved settings have loaded, and only while crash reports are on in them (see `syncSentry`).
 */
function startSentry() {
  started = true;
  Sentry.init({
    dsn: DSN,
    enabled: !__DEV__,
    sendDefaultPii: false,
    // Screen load times from a sample of sessions; errors are always reported
    tracesSampleRate: 0.1,
    integrations: [ navigationIntegration ],
    enableNativeFramesTracking: !isRunningInExpoGo(),
    // Nothing is sent once crash reports are turned off, even before Sentry has finished closing
    beforeSend: event => (useSettings.getState().crashReports ? event : null),
    beforeSendTransaction: event => (useSettings.getState().crashReports ? event : null),
  });
}

/**
 * Starts or stops Sentry to match the "Send crash reports" setting. Closing it also stops the native SDK, so native
 * crashes aren't reported either; reports it had waiting stay on the phone until crash reports are turned on again.
 */
export function syncSentry(enabled: boolean) {
  if (enabled && !started) {
    startSentry();
  } else if (!enabled && started) {
    started = false;
    void Sentry.close();
  }
}

export { Sentry };
