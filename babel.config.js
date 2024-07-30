module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Other plugins
      'inline-dotenv', // Ensure you have inline-dotenv or equivalent installed and configured
      'nativewind/babel',
    ],
  };
};
