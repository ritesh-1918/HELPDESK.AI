// metro.config.js – extend Expo's default Metro config
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  // Add any customizations here if needed (e.g., extra asset extensions)
  return defaultConfig;
})();
