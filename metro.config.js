const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// 👇 Modify the resolver to handle .svg files
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// 👇 Keep NativeWind integration
module.exports = withNativeWind(config, { input: './global.css' });