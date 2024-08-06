module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo',
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript',
      "module:metro-react-native-babel-preset",
  ],
    plugins: [
      // Other plugins
      'inline-dotenv', // Ensure you have inline-dotenv or equivalent installed and configured
      'nativewind/babel',
      "@babel/plugin-transform-class-properties",
      "@babel/plugin-transform-private-methods",
      "@babel/plugin-transform-private-property-in-object",
      "@babel/plugin-transform-modules-commonjs",
    ],
  };
};
