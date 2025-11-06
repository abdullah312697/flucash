module.exports = function override(config, env) {
  config.module.rules = config.module.rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf.unshift({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/react-facebook-pixel\/dist\/fb-pixel.js/
        ],
      });
    }
    return rule;
  });

  return config;
};
