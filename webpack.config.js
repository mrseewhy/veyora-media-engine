module.exports = (config, {}) => {
  config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', ...(config.resolve.extensions || [])];
  return config;
};
