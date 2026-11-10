// Metro, with Sentry's additions: each bundle gets a debug ID, so crash reports can be matched with their source maps
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
