module.exports = function(api) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  api.cache(true);
  return {
    presets: [ 'babel-preset-expo' ],
    plugins: [
      'react-native-reanimated/plugin',
      'module:react-native-dotenv',
      [
        'module-resolver',
        {
          root: [ './' ],
          alias: {
            '@': './components',
            '@utils': './utils',
            '@styles': './styles',
            'types': './types/types.ts',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
    ],
  };
};
