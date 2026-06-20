const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Stub out modules that don't work on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'expo-splash-screen') {
    return { type: 'sourceFile', filePath: __dirname + '/src/stubs/expo-splash-screen.web.js' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
