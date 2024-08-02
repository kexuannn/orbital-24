// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  
  // You can customize the config here if needed
  return {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
      
      // Add any additional extensions if needed
      sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs']
    },
    transformer: {
      ...defaultConfig.transformer,
      babelTransformerPath: require.resolve('nativewind/babel'),
      // Customize transformer options if needed
      asyncTransform: true
    },
  };
})();
