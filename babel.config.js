module.exports = function (api) {
  api.cache(true);
  return {
    // Since SDK 50, babel-preset-expo includes the expo-router transform; the separate plugin is deprecated.
    presets: ['babel-preset-expo'],
  };
};
