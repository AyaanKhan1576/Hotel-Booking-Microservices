const path = require('path');
module.exports = function override(config) {
  config.resolve.modules = [
    ...config.resolve.modules,
    path.resolve(__dirname, 'src-booking'),
    path.resolve(__dirname, 'src-hotel'),
    path.resolve(__dirname, 'src-user'),
  ];
  return config;
};