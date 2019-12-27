module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/platform/dist' : '.',
  productionSourceMap: false,
};
